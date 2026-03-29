import crypto from 'crypto';
import prisma from '../config/database';
import { SCIMUser } from '../shared/types/EnterpriseTypes';

class EnterpriseService {

  // ── Organizations ──────────────────────────────────────────────────────

  async createOrganization(data: {
    name: string;
    slug?: string;
    contactEmail: string;
    plan?: string;
    ownerId: string;
    billingEmail?: string;
  }) {
    const slug = data.slug || this.generateSlug(data.name);

    const org = await prisma.organization.create({
      data: {
        name: data.name,
        slug,
        contactEmail: data.contactEmail,
        billingEmail: data.billingEmail || data.contactEmail,
        plan: data.plan || 'business',
        ownerId: data.ownerId,
        members: {
          create: {
            userId: data.ownerId,
            role: 'owner',
            joinedAt: new Date(),
          },
        },
        whiteLabelConfig: {
          create: {
            appName: data.name,
          },
        },
      },
      include: { whiteLabelConfig: true },
    });

    return org;
  }

  async getOrganization(orgId: string) {
    return prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        whiteLabelConfig: true,
        ssoConfig: { select: { provider: true, isActive: true, scimEnabled: true } },
        _count: { select: { members: true, apiKeys: true } },
      },
    });
  }

  async listUserOrganizations(userId: string) {
    return prisma.orgMember.findMany({
      where: { userId, isActive: true },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            whiteLabelConfig: { select: { logoUrl: true, primaryColor: true, appName: true } },
          },
        },
      },
    });
  }

  async inviteMember(orgId: string, email: string, role: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      // Store pending invite (user doesn't exist yet) — simplified
      return { status: 'pending', email, role };
    }

    const member = await prisma.orgMember.upsert({
      where: { organizationId_userId: { organizationId: orgId, userId: user.id } },
      update: { role, isActive: true },
      create: { organizationId: orgId, userId: user.id, role },
    });

    return { status: 'added', member };
  }

  async removeMember(orgId: string, userId: string) {
    await prisma.orgMember.update({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      data: { isActive: false },
    });
  }

  // ── White-Label Config ─────────────────────────────────────────────────

  async updateWhiteLabel(orgId: string, config: {
    appName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    customDomain?: string;
    customCSS?: string;
    emailFromName?: string;
    emailFromAddr?: string;
    supportEmail?: string;
    hideWacoProBranding?: boolean;
  }) {
    return prisma.whiteLabelConfig.upsert({
      where: { organizationId: orgId },
      update: { ...config, updatedAt: new Date() },
      create: { organizationId: orgId, ...config },
    });
  }

  async getWhiteLabelByDomain(domain: string) {
    return prisma.whiteLabelConfig.findFirst({
      where: { customDomain: domain },
      include: { organization: { select: { id: true, name: true, plan: true } } },
    });
  }

  // ── SSO Configuration ──────────────────────────────────────────────────

  async configureSSOSAML(orgId: string, config: {
    provider: string;
    entityId: string;
    ssoUrl: string;
    x509Cert: string;
    attributeMap?: Record<string, string>;
  }) {
    return prisma.sSOConfig.upsert({
      where: { organizationId: orgId },
      update: { ...config, isActive: true, updatedAt: new Date() },
      create: { organizationId: orgId, ...config, isActive: true },
    });
  }

  async initiateSSOLogin(orgSlug: string) {
    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      include: { ssoConfig: true },
    });

    if (!org?.ssoConfig?.isActive) {
      throw new Error('SSO no configurado para esta organización');
    }

    const ssoConfig = org.ssoConfig;

    // Generate SAML AuthnRequest
    const requestId = `_${crypto.randomUUID().replace(/-/g, '')}`;
    const issueInstant = new Date().toISOString();

    const samlRequest = Buffer.from(`
      <samlp:AuthnRequest
        xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${requestId}"
        Version="2.0"
        IssueInstant="${issueInstant}"
        AssertionConsumerServiceURL="${process.env.API_URL}/api/enterprise/sso/callback/${orgSlug}"
        Destination="${ssoConfig.ssoUrl}"
      >
        <saml:Issuer>${process.env.API_URL}</saml:Issuer>
      </samlp:AuthnRequest>
    `).toString('base64');

    return {
      ssoUrl: ssoConfig.ssoUrl,
      samlRequest,
      relayState: orgSlug,
      redirectUrl: `${ssoConfig.ssoUrl}?SAMLRequest=${encodeURIComponent(samlRequest)}&RelayState=${orgSlug}`,
    };
  }

  // ── SCIM Provisioning ──────────────────────────────────────────────────

  async scimListUsers(orgId: string, filter?: string) {
    const members = await prisma.orgMember.findMany({
      where: { organizationId: orgId, isActive: true },
    });

    const userIds = members.map(m => m.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, isActive: true },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: members.length,
      Resources: members.map(m => {
        const user = userMap.get(m.userId);
        return user ? this.toSCIMUser(user, m.role) : null;
      }).filter(Boolean),
    };
  }

  async scimCreateUser(orgId: string, scimUser: SCIMUser) {
    const email = scimUser.emails.find(e => e.primary)?.value || scimUser.emails[0]?.value;
    if (!email) throw new Error('Email requerido');

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: `${scimUser.name.givenName} ${scimUser.name.familyName}`, isActive: scimUser.active },
      create: {
        email,
        name: `${scimUser.name.givenName} ${scimUser.name.familyName}`,
        password: crypto.randomBytes(32).toString('hex'), // SSO users don't need password
        isActive: scimUser.active,
        isVerified: true,
      },
    });

    // Add to org
    await prisma.orgMember.upsert({
      where: { organizationId_userId: { organizationId: orgId, userId: user.id } },
      update: { isActive: scimUser.active },
      create: { organizationId: orgId, userId: user.id, role: 'member', joinedAt: new Date() },
    });

    return this.toSCIMUser(user, 'member');
  }

  async scimUpdateUser(orgId: string, userId: string, patch: Partial<SCIMUser>) {
    const updates: Record<string, unknown> = {};
    if (patch.name) updates.name = `${patch.name.givenName} ${patch.name.familyName}`;
    if (patch.active !== undefined) updates.isActive = patch.active;

    const user = await prisma.user.update({ where: { id: userId }, data: updates });

    if (patch.active === false) {
      await prisma.orgMember.updateMany({
        where: { organizationId: orgId, userId },
        data: { isActive: false },
      });
    }

    return this.toSCIMUser(user, 'member');
  }

  // ── API Key Management ─────────────────────────────────────────────────

  async createAPIKey(orgId: string, data: { name: string; scopes: string[]; expiresAt?: Date; rateLimit?: number }) {
    const rawKey = `wk_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.slice(0, 12);

    const apiKey = await prisma.aPIKey.create({
      data: {
        organizationId: orgId,
        name: data.name,
        keyHash,
        keyPrefix,
        scopes: data.scopes,
        rateLimit: data.rateLimit || 1000,
        expiresAt: data.expiresAt,
      },
    });

    // Return raw key ONCE — never stored
    return { ...apiKey, rawKey };
  }

  async listAPIKeys(orgId: string) {
    return prisma.aPIKey.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        rateLimit: true,
        isActive: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeAPIKey(orgId: string, keyId: string) {
    await prisma.aPIKey.update({
      where: { id: keyId, organizationId: orgId },
      data: { isActive: false },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) + `-${crypto.randomBytes(2).toString('hex')}`;
  }

  private toSCIMUser(user: { id: string; name: string; email: string; isActive: boolean }, role: string) {
    const [givenName, ...rest] = user.name.split(' ');
    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: user.id,
      userName: user.email,
      name: { givenName, familyName: rest.join(' ') },
      emails: [{ value: user.email, primary: true }],
      active: user.isActive,
      roles: [{ value: role, primary: true }],
    };
  }
}

export const enterpriseService = new EnterpriseService();
export default enterpriseService;
