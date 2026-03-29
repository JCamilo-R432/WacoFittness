#!/usr/bin/env python3
"""Append Phase 5 Prisma models to schema.prisma"""
import os

schema_path = r"C:\Users\jrive\Documents\ServicioDeApps1Musculacion\prisma\schema.prisma"

phase5_models = '''
// ─── Phase 5: Enterprise + Multi-tenant + Billing + Compliance + Growth ──────

model Organization {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique
  domain          String?  @unique
  plan            String   @default("business")
  ownerId         String
  contactEmail    String
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  trialEndsAt     DateTime?
  contractEndsAt  DateTime?
  monthlyBudget   Decimal? @db.Decimal(12, 2)
  currency        String   @default("USD")
  billingEmail    String?
  taxId           String?
  allowOverage    Boolean  @default(false)

  whiteLabelConfig  WhiteLabelConfig?
  members           OrgMember[]
  apiKeys           APIKey[]
  usageRecords      UsageRecord[]
  invoices          Invoice[]
  complianceAudits  ComplianceAudit[]
  ssoConfig         SSOConfig?
  abTests           ABTest[]
  dataResidencyRule DataResidencyRule?

  @@map("organizations")
  @@index([slug])
}

model OrgMember {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String
  role           String       @default("member")
  invitedAt      DateTime     @default(now())
  joinedAt       DateTime?
  isActive       Boolean      @default(true)

  @@unique([organizationId, userId])
  @@map("org_members")
  @@index([organizationId])
  @@index([userId])
}

model WhiteLabelConfig {
  id             String       @id @default(uuid())
  organizationId String       @unique
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  appName        String       @default("WacoPro")
  primaryColor   String       @default("#6c63ff")
  secondaryColor String       @default("#48bb78")
  accentColor    String?
  logoUrl        String?
  faviconUrl     String?
  customDomain   String?
  customCSS      String?      @db.Text
  emailFromName  String?
  emailFromAddr  String?
  supportEmail   String?
  hideWacoProBranding Boolean @default(false)
  metadata       Json?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@map("white_label_configs")
}

model SSOConfig {
  id             String       @id @default(uuid())
  organizationId String       @unique
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  provider       String
  entityId       String?
  ssoUrl         String?
  x509Cert       String?      @db.Text
  attributeMap   Json?
  scimEnabled    Boolean      @default(false)
  scimToken      String?
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@map("sso_configs")
}

model APIKey {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  keyHash        String       @unique
  keyPrefix      String
  scopes         String[]
  rateLimit      Int          @default(1000)
  isActive       Boolean      @default(true)
  expiresAt      DateTime?
  lastUsedAt     DateTime?
  createdAt      DateTime     @default(now())
  usageRecords   UsageRecord[]

  @@map("api_keys")
  @@index([keyHash])
  @@index([organizationId])
}

model UsageRecord {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  apiKeyId       String?
  apiKey         APIKey?      @relation(fields: [apiKeyId], references: [id])
  userId         String?
  endpoint       String
  method         String       @default("POST")
  category       String
  quantity       Decimal      @default(1) @db.Decimal(12, 4)
  unitCost       Decimal      @default(0) @db.Decimal(12, 6)
  totalCost      Decimal      @default(0) @db.Decimal(12, 4)
  responseMs     Int?
  statusCode     Int?
  metadata       Json?
  billedAt       DateTime?
  timestamp      DateTime     @default(now())

  @@map("usage_records")
  @@index([organizationId, timestamp])
  @@index([billedAt])
}

model Invoice {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invoiceNumber  String       @unique
  periodStart    DateTime
  periodEnd      DateTime
  status         String       @default("draft")
  subtotal       Decimal      @db.Decimal(12, 2)
  tax            Decimal      @default(0) @db.Decimal(12, 2)
  total          Decimal      @db.Decimal(12, 2)
  currency       String       @default("USD")
  lineItems      Json
  pdfUrl         String?
  stripeInvoiceId String?
  dueDate        DateTime
  paidAt         DateTime?
  voidedAt       DateTime?
  notes          String?      @db.Text
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@map("invoices")
  @@index([organizationId, status])
}

model ComplianceAudit {
  id             String        @id @default(uuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  framework      String
  controlId      String
  controlName    String
  status         String
  executedAt     DateTime      @default(now())
  executedBy     String        @default("automated")
  evidence       Json
  findings       Json?
  remediation    String?       @db.Text
  dueDate        DateTime?
  resolvedAt     DateTime?

  @@map("compliance_audits")
  @@index([framework, status])
}

model DataResidencyRule {
  id             String       @id @default(uuid())
  organizationId String       @unique
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  allowedRegions String[]
  primaryRegion  String       @default("us-east-1")
  blockCrossRegion Boolean    @default(false)
  piiFields      String[]
  retentionDays  Int          @default(2555)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@map("data_residency_rules")
}

model ABTest {
  id             String        @id @default(uuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  name           String
  description    String?
  status         String        @default("draft")
  variants       Json
  targetAudience Json?
  primaryMetric  String        @default("conversion_rate")
  startedAt      DateTime?
  endedAt        DateTime?
  winnerVariant  String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  exposures      ABTestExposure[]

  @@map("ab_tests")
  @@index([status])
}

model ABTestExposure {
  id          String   @id @default(uuid())
  testId      String
  test        ABTest   @relation(fields: [testId], references: [id], onDelete: Cascade)
  userId      String
  variant     String
  exposedAt   DateTime @default(now())
  converted   Boolean  @default(false)
  convertedAt DateTime?
  metadata    Json?

  @@unique([testId, userId])
  @@map("ab_test_exposures")
  @@index([testId, variant])
}
'''

with open(schema_path, 'a', encoding='utf-8') as f:
    f.write(phase5_models)

print("Phase 5 schema models appended successfully.")
