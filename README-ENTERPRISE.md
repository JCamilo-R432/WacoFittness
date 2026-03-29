# WacoPro Enterprise Features — Phase 5

## Overview

WacoPro Phase 5 transforms the platform into a full B2B enterprise solution with multi-tenant isolation, white-label customization, SSO/SAML, SCIM provisioning, API marketplace, and usage-based billing.

---

## Quick Start

```bash
# 1. Run Prisma migration for Phase 5 models
npx prisma db push

# 2. Start the server
npm run dev

# 3. Create first organization (as admin)
curl -X POST http://localhost:3000/api/enterprise \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "contactEmail": "admin@acme.com", "plan": "enterprise"}'
```

---

## API Reference

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enterprise` | Create organization |
| GET | `/api/enterprise/my-orgs` | List my organizations |
| GET | `/api/enterprise/org` | Get org details |
| POST | `/api/enterprise/org/members` | Invite member |
| DELETE | `/api/enterprise/org/members/:userId` | Remove member |

**Headers for org-scoped requests:**
```
X-Organization-Id: <org-id>
# OR
X-Organization-Slug: acme-corp
```

### White-Label

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enterprise/org/white-label` | Get config |
| PUT | `/api/enterprise/org/white-label` | Update config |
| GET | `/api/enterprise/white-label/domain?domain=app.acme.com` | Resolve by domain |

**Example white-label config:**
```json
{
  "appName": "Acme Fitness",
  "primaryColor": "#0066cc",
  "secondaryColor": "#00aa44",
  "logoUrl": "https://acme.com/logo.png",
  "customDomain": "fitness.acme.com",
  "hideWacoProBranding": true
}
```

### SSO/SAML

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enterprise/org/sso/saml` | Configure SAML |
| GET | `/api/enterprise/sso/init?org=acme-corp` | Initiate SSO login |

**Supported SSO Providers:** Okta, Azure AD, Google Workspace, OneLogin

**Example SAML config:**
```json
{
  "provider": "okta",
  "entityId": "https://acme.okta.com",
  "ssoUrl": "https://acme.okta.com/app/wacopro/sso/saml",
  "x509Cert": "MIIDBTCCAe2gAw..."
}
```

### SCIM Provisioning

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enterprise/org/scim/users` | List users |
| POST | `/api/enterprise/org/scim/users` | Create user |
| PATCH | `/api/enterprise/org/scim/users/:userId` | Update user |

Enable SCIM in your IdP with:
- **Base URL:** `https://api.wacopro.com/api/enterprise/org/scim`
- **Bearer Token:** Generated from org settings

### API Keys (Marketplace)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enterprise/org/api-keys` | List keys |
| POST | `/api/enterprise/org/api-keys` | Create key |
| DELETE | `/api/enterprise/org/api-keys/:keyId` | Revoke key |

**Available Scopes:**
- `read:workouts` — Read workout data
- `write:nutrition` — Log nutrition
- `ai:*` — Access all AI features
- `admin:*` — Administrative operations

---

## Multi-Tenant Isolation

All data is isolated per organization. A user can be a member of multiple organizations. Organization context is passed via HTTP headers:

```http
GET /api/enterprise/org
Authorization: Bearer <JWT>
X-Organization-Id: org_abc123
```

### Role Hierarchy

| Role | Permissions |
|------|-------------|
| `member` | Read access to org data |
| `coach` | Read + create workouts/plans for members |
| `admin` | Manage members, API keys, white-label |
| `owner` | Full access including SSO, SCIM, billing |

---

## Enterprise Plans

| Feature | Business ($499/mo) | Enterprise (custom) |
|---------|------------------|-------------------|
| Active Users | 100 | Unlimited |
| API Calls/month | 2M | Unlimited |
| AI Inferences | 20,000 | Unlimited |
| White-label | ✅ | ✅ |
| SSO/SAML | ✅ | ✅ |
| SCIM | ✅ | ✅ |
| Custom Domain | ✅ | ✅ |
| HIPAA BAA | ❌ | ✅ |
| SOC2 Report | ❌ | ✅ |
| SLA | 99.95% | 99.99% |
| Support | Dedicated | SLA-backed |

---

## Environment Variables (Phase 5)

```env
# Organization
API_URL=https://api.wacopro.com

# SAML (per org - stored in DB)
# No env vars needed — configured via API

# Kafka (optional - falls back to console)
KAFKA_BROKERS=kafka1:9092,kafka2:9092
KAFKA_SSL=true
KAFKA_SASL_USERNAME=wacopro
KAFKA_SASL_PASSWORD=secret

# Cloudflare Workers (for edge deployment)
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```
