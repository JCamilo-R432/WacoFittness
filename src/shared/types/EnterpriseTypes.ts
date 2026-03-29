export interface OrganizationContext {
  organizationId: string;
  organizationSlug: string;
  plan: string;
  memberRole: string; // owner, admin, coach, member
}

export interface APIKeyPayload {
  keyId: string;
  organizationId: string;
  scopes: string[];
}

export interface WhiteLabelTheme {
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customDomain?: string;
  hideWacoProBranding: boolean;
}

export interface SSOInitiatePayload {
  organizationSlug: string;
  redirectUri?: string;
  state?: string;
}

export interface SCIMUser {
  id?: string;
  userName: string;
  name: { givenName: string; familyName: string };
  emails: Array<{ value: string; primary: boolean }>;
  active: boolean;
  groups?: Array<{ value: string; display: string }>;
}

export interface UsageSnapshot {
  organizationId: string;
  period: { start: Date; end: Date };
  byCategory: Record<string, { quantity: number; totalCost: number }>;
  totalCost: number;
  currency: string;
}

export interface InvoiceLineItem {
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ComplianceControlResult {
  controlId: string;
  controlName: string;
  framework: string;
  status: 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | 'IN_PROGRESS';
  evidence: Record<string, unknown>;
  findings?: unknown[];
  remediation?: string;
}

export interface ABTestVariant {
  name: string;
  weight: number; // 0-100, must sum to 100
  config: Record<string, unknown>;
}

export interface ABTestResults {
  testName: string;
  totalExposures: number;
  variants: Array<{
    name: string;
    exposures: number;
    conversions: number;
    conversionRate: number;
    lift?: number;
    pValue?: number;
    significant: boolean;
  }>;
  winnerVariant?: string;
  recommendation: 'ROLLOUT' | 'REVERT' | 'CONTINUE' | 'INSUFFICIENT_DATA';
}
