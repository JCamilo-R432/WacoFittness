export const ENTERPRISE_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    apiCallsPerMonth: 1000,
    aiInferencesPerMonth: 5,
    storageGB: 1,
    activeUsers: 1,
    overageAllowed: false,
    sla: null,
    support: 'community',
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 999, // cents
    apiCallsPerMonth: 50_000,
    aiInferencesPerMonth: 500,
    storageGB: 10,
    activeUsers: 1,
    overageAllowed: true,
    sla: '99.5',
    support: 'email',
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 1999,
    apiCallsPerMonth: 200_000,
    aiInferencesPerMonth: 2000,
    storageGB: 50,
    activeUsers: 1,
    overageAllowed: true,
    sla: '99.9',
    support: 'priority',
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    monthlyPrice: 49900, // $499/mo
    apiCallsPerMonth: 2_000_000,
    aiInferencesPerMonth: 20_000,
    storageGB: 500,
    activeUsers: 100,
    overageAllowed: true,
    sla: '99.95',
    support: 'dedicated',
    features: ['white_label', 'sso', 'scim', 'multi_tenant', 'custom_domain'],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null, // negotiated
    apiCallsPerMonth: null, // unlimited
    aiInferencesPerMonth: null,
    storageGB: null,
    activeUsers: null,
    overageAllowed: true,
    sla: '99.99',
    support: 'sla_backed',
    features: ['white_label', 'sso', 'scim', 'multi_tenant', 'custom_domain', 'dedicated_infra', 'hipaa', 'soc2', 'custom_contract'],
  },
} as const;

export type TierKey = keyof typeof ENTERPRISE_TIERS;

// Usage-based pricing (per unit in USD cents)
export const USAGE_PRICING = {
  api_call: 0.001,        // $0.001 per API call above limit
  ai_inference: 0.05,     // $0.05 per AI inference above limit
  storage_gb: 0.023,      // $0.023 per GB/month above limit
  active_user: 0.50,      // $0.50 per active user above limit
} as const;

export type UsageCategory = keyof typeof USAGE_PRICING;
