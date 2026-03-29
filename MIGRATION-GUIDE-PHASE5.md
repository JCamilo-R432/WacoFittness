# Migration Guide: Phase 4 → Phase 5

## What's New in Phase 5

- **Multi-tenant Organizations** — B2B orgs with member roles, isolation, and billing
- **White-label Platform** — Custom branding per organization
- **SSO/SAML** — Okta, Azure AD, Google Workspace integration
- **SCIM Provisioning** — Auto-sync users from corporate directories
- **API Marketplace** — Developer API keys with scopes + rate limits
- **Usage-Based Billing** — Metered billing per API category
- **Compliance Automation** — SOC2, HIPAA, GDPR automated controls
- **A/B Testing** — Experiment framework with statistical significance
- **Kubernetes + GitOps** — Multi-region deployment with ArgoCD
- **Cloudflare Edge** — Geo-routing + data residency enforcement

---

## Step 1: Database Migration

```bash
# Apply Phase 5 schema changes
npx prisma db push

# Verify new tables
npx prisma studio
# Check: organizations, org_members, white_label_configs, sso_configs,
#        api_keys, usage_records, invoices, compliance_audits,
#        data_residency_rules, ab_tests, ab_test_exposures
```

---

## Step 2: Environment Variables

Add to `.env`:

```env
# Multi-region (optional — used by Cloudflare edge worker)
REGION=us-east-1
API_URL=https://api.wacopro.com

# Kafka (optional — falls back gracefully)
KAFKA_BROKERS=
KAFKA_SSL=false
KAFKA_SASL_USERNAME=
KAFKA_SASL_PASSWORD=

# Cloudflare (for edge deployment)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

# A/B Testing (optional — Statsig)
STATSIG_SERVER_SECRET=
```

---

## Step 3: Install Dependencies

```bash
# No new npm packages required for Phase 5 core
# Optional: Kafka
npm install kafkajs

# Optional: A/B testing with Statsig
npm install statsig-node
```

---

## Step 4: Update Your App

All Phase 5 routes are auto-registered. No changes needed to existing code.

```bash
npm run dev
```

Verify new endpoints:
```bash
curl http://localhost:3000/api/health
# Should show version 5.0.0

curl http://localhost:3000/api/enterprise/my-orgs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Step 5: Create First Enterprise Organization

```bash
# Get admin token first (login as admin user)
ADMIN_TOKEN="..."

# Create organization
curl -X POST http://localhost:3000/api/enterprise \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "contactEmail": "admin@mycompany.com",
    "plan": "business"
  }'

# Response includes org.id and org.slug
ORG_ID="..."

# Configure white-label
curl -X PUT http://localhost:3000/api/enterprise/org/white-label \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "MyCompany Fitness",
    "primaryColor": "#0066cc"
  }'
```

---

## Step 6: Deploy to Kubernetes (Production)

See `DEPLOY-GUIDE-KUBERNETES.md` for full instructions.

```bash
# Quick start with local kind cluster
kind create cluster --name wacopro-local
kubectl apply -k k8s/overlays/production-us-east
```

---

## Step 7: Deploy Cloudflare Edge Worker

```bash
npm install -g wrangler

# Configure wrangler.toml
cat > wrangler.toml << EOF
name = "wacopro-geo-routing"
main = "infrastructure/edge/geo-routing.ts"
compatibility_date = "2024-01-01"

[vars]
WACOPRO_API_US_EAST = "https://us-east.wacopro.com"
WACOPRO_API_EU_CENTRAL = "https://eu.wacopro.com"
WACOPRO_API_AP_SOUTHEAST = "https://ap.wacopro.com"
EOF

# Deploy
wrangler deploy
```

---

## Step 8: Run Initial Compliance Check

```bash
# Run automated SOC2 controls
curl -X GET http://localhost:3000/api/compliance/controls/SOC2 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Run GDPR controls
curl -X GET http://localhost:3000/api/compliance/controls/GDPR \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Breaking Changes

None. Phase 5 is purely additive.

- All Phase 1-4 endpoints continue to work unchanged
- New middleware (`multiTenant`, `apiKey`) is opt-in per route
- Usage metering is fire-and-forget (never blocks responses)
- Compliance controls can run without any org context

---

## Rollback (if needed)

Phase 5 adds new tables only — no existing tables modified.

```bash
# To remove Phase 5 tables (last resort)
npx prisma migrate reset  # WARNING: destroys ALL data
# OR manually drop: organizations, org_members, white_label_configs,
#                   sso_configs, api_keys, usage_records, invoices,
#                   compliance_audits, data_residency_rules, ab_tests, ab_test_exposures
```
