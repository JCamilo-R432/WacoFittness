# WacoPro Compliance Guide — SOC2 / HIPAA / GDPR

## Overview

WacoPro Phase 5 includes automated compliance controls for SOC2 Type II, HIPAA, and GDPR.
Controls run automatically via GitHub Actions every Monday and generate structured evidence.

---

## Quick Commands

```bash
# Run all SOC2 controls (requires admin token)
curl -X GET http://localhost:3000/api/compliance/controls/SOC2 \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Run GDPR controls
curl -X GET http://localhost:3000/api/compliance/controls/GDPR \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Generate compliance report
curl -X GET http://localhost:3000/api/compliance/report/SOC2 \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Export your data (GDPR Art. 20)
curl -X GET http://localhost:3000/api/compliance/gdpr/export \
  -H "Authorization: Bearer USER_TOKEN"

# Request account deletion (GDPR Art. 17)
curl -X POST http://localhost:3000/api/compliance/gdpr/delete \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"confirm": "DELETE_MY_ACCOUNT"}'
```

---

## SOC2 Controls (Automated)

| Control ID | Name | Category | Auto? |
|------------|------|----------|-------|
| CC6.1 | Authentication (2FA adoption) | Access Control | ✅ |
| CC6.2 | Inactive admin detection | Access Control | ✅ |
| CC6.3 | RBAC implementation | Access Control | ✅ |
| CC7.1 | Audit log presence | System Operations | ✅ |
| CC7.2 | Rate limiting active | Anomaly Detection | ✅ |
| A1.1 | Health endpoint / metrics | Availability | ✅ |
| PI1.1 | Database constraint checks | Data Integrity | ✅ |
| P4.1 | Retention policy defined | Privacy | ✅ |
| CC8.1 | Change management | Change Mgmt | ❌ Manual |

### Thresholds

- **CC6.1 (2FA):** PASS if ≥80% of users have 2FA enabled
- **CC6.2 (Access Review):** PASS if no admin has been inactive >90 days
- **CC7.1 (Monitoring):** PASS if audit logs exist

---

## HIPAA Controls (Automated)

| Control ID | Name | Status |
|------------|------|--------|
| PHI-ENC-01 | Encryption at rest (Supabase/AWS RDS AES-256) | ✅ Auto |
| PHI-ENC-02 | TLS 1.3 in transit | ✅ Auto |
| PHI-AUD-01 | Access audit logs | ✅ Auto |
| PHI-AUT-01 | Unique user identification | ✅ Auto |
| PHI-BAA-01 | Business Associate Agreements | ❌ Manual |
| PHI-TRN-01 | Workforce training | ❌ Manual |

**Note:** For HIPAA compliance, you must:
1. Execute BAAs with Supabase, Stripe, SendGrid, and OpenAI
2. Document workforce training records
3. Maintain an emergency access procedure

---

## GDPR Controls (Automated)

| Article | Name | Status |
|---------|------|--------|
| Art. 7 | Consent management (aiOptOut field) | ✅ Auto |
| Art. 17 | Right to erasure (DELETE /api/compliance/gdpr/delete) | ✅ Auto |
| Art. 20 | Data portability (GET /api/compliance/gdpr/export) | ✅ Auto |
| Art. 32 | Security of processing | ✅ Auto |
| Art. 6 | Lawful basis for processing | ❌ Manual |
| Art. 13 | Privacy notice at collection | ❌ Manual |
| Art. 35 | DPIA for high-risk processing | ❌ Manual |

---

## Data Residency Configuration

For organizations requiring EU data residency:

```bash
curl -X PUT http://localhost:3000/api/compliance/org/residency \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "X-Organization-Id: YOUR_ORG_ID" \
  -d '{
    "allowedRegions": ["eu-central-1"],
    "primaryRegion": "eu-central-1",
    "blockCrossRegion": true,
    "retentionDays": 1825
  }'
```

The Cloudflare edge worker automatically routes EU-country users to the EU cluster.

---

## Evidence Retention

Compliance evidence is stored in:
- **Database:** `compliance_audits` table (queryable via API)
- **GitHub Actions Artifacts:** Retained 365 days per run
- **Recommended:** Export weekly reports to secure S3 bucket for long-term retention

---

## Incident Response

If a security incident occurs:

1. **HIPAA:** Notify affected individuals within 60 days, HHS within 60 days (if >500 individuals)
2. **GDPR:** Notify supervisory authority within 72 hours (Art. 33)
3. **SOC2:** Document in incident register, update risk assessment

```bash
# Create support ticket for incident tracking
curl -X POST http://localhost:3000/api/security/tickets \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"subject": "Security Incident", "category": "security", "priority": "critical"}'
```
