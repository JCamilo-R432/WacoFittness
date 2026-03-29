import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrgRequest } from '../middleware/multiTenant';
import enterpriseService from '../services/enterprise.service';

type Req = AuthRequest & OrgRequest;

// ── Organizations ──────────────────────────────────────────────────────────

export const createOrganization = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug, contactEmail, plan, billingEmail } = req.body;
    if (!name || !contactEmail) {
      res.status(400).json({ error: 'name y contactEmail son requeridos' });
      return;
    }

    const org = await enterpriseService.createOrganization({
      name,
      slug,
      contactEmail,
      plan,
      billingEmail,
      ownerId: req.user!.id,
    });

    res.status(201).json({ success: true, organization: org });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Ya existe una organización con ese slug o dominio' });
      return;
    }
    next(err);
  }
};

export const getOrganization = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const org = await enterpriseService.getOrganization(req.organization!.id);
    if (!org) { res.status(404).json({ error: 'Organización no encontrada' }); return; }
    res.json({ success: true, organization: org });
  } catch (err) { next(err); }
};

export const listMyOrganizations = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orgs = await enterpriseService.listUserOrganizations(req.user!.id);
    res.json({ success: true, organizations: orgs });
  } catch (err) { next(err); }
};

export const inviteMember = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, role = 'member' } = req.body;
    if (!email) { res.status(400).json({ error: 'email requerido' }); return; }

    const result = await enterpriseService.inviteMember(req.organization!.id, email, role);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const removeMember = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    await enterpriseService.removeMember(req.organization!.id, req.params.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ── White-Label ────────────────────────────────────────────────────────────

export const getWhiteLabel = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const org = await enterpriseService.getOrganization(req.organization!.id);
    res.json({ success: true, config: org?.whiteLabelConfig });
  } catch (err) { next(err); }
};

export const updateWhiteLabel = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await enterpriseService.updateWhiteLabel(req.organization!.id, req.body);
    res.json({ success: true, config });
  } catch (err) { next(err); }
};

export const getWhiteLabelByDomain = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const domain = req.query.domain as string;
    if (!domain) { res.status(400).json({ error: 'domain requerido' }); return; }

    const config = await enterpriseService.getWhiteLabelByDomain(domain);
    if (!config) { res.status(404).json({ error: 'Dominio no registrado' }); return; }

    res.json({ success: true, config });
  } catch (err) { next(err); }
};

// ── SSO ────────────────────────────────────────────────────────────────────

export const configureSSOSAML = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider, entityId, ssoUrl, x509Cert, attributeMap } = req.body;
    if (!provider || !ssoUrl || !x509Cert) {
      res.status(400).json({ error: 'provider, ssoUrl y x509Cert son requeridos' });
      return;
    }

    const config = await enterpriseService.configureSSOSAML(req.organization!.id, {
      provider, entityId, ssoUrl, x509Cert, attributeMap,
    });

    res.json({ success: true, ssoConfig: { provider: config.provider, isActive: config.isActive } });
  } catch (err) { next(err); }
};

export const initiateSSOLogin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { org } = req.query;
    if (!org) { res.status(400).json({ error: 'org slug requerido' }); return; }

    const ssoData = await enterpriseService.initiateSSOLogin(String(org));
    res.json({ success: true, ...ssoData });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ── SCIM ───────────────────────────────────────────────────────────────────

export const scimListUsers = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await enterpriseService.scimListUsers(req.organization!.id, req.query.filter as string);
    res.json(result);
  } catch (err) { next(err); }
};

export const scimCreateUser = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await enterpriseService.scimCreateUser(req.organization!.id, req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
};

export const scimUpdateUser = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await enterpriseService.scimUpdateUser(req.organization!.id, req.params.userId, req.body);
    res.json(user);
  } catch (err) { next(err); }
};

// ── API Keys ───────────────────────────────────────────────────────────────

export const listAPIKeys = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const keys = await enterpriseService.listAPIKeys(req.organization!.id);
    res.json({ success: true, apiKeys: keys });
  } catch (err) { next(err); }
};

export const createAPIKey = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, scopes, expiresAt, rateLimit } = req.body;
    if (!name || !scopes?.length) {
      res.status(400).json({ error: 'name y scopes son requeridos' });
      return;
    }

    const key = await enterpriseService.createAPIKey(req.organization!.id, {
      name,
      scopes,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      rateLimit,
    });

    res.status(201).json({
      success: true,
      apiKey: key,
      warning: 'Guarda la rawKey. No se mostrará de nuevo.',
    });
  } catch (err) { next(err); }
};

export const revokeAPIKey = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    await enterpriseService.revokeAPIKey(req.organization!.id, req.params.keyId);
    res.json({ success: true });
  } catch (err) { next(err); }
};
