export interface PlanLimits {
  dailyFoodLogs: number;   // -1 = ilimitado
  savedWorkouts: number;
  apiCallsPerDay: number;
  mealPlansPerMonth: number;
  analyticsHistory: number; // días
  socialPosts: number;     // por día
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;           // en centavos USD
  priceMonthly: number;    // para display
  stripePriceId: string;   // configurar en Stripe Dashboard
  features: string[];
  limits: PlanLimits;
  trialDays: number;
  color: string;
  badge?: string;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  FREE: {
    id: 'free',
    name: 'Gratis',
    price: 0,
    priceMonthly: 0,
    stripePriceId: '',
    features: [
      'Dashboard básico',
      '10 registros de alimentos/día',
      '3 rutinas guardadas',
      'Social feed básico',
      'Tracking de hidratación',
      'Soporte por email',
    ],
    limits: {
      dailyFoodLogs: 10,
      savedWorkouts: 3,
      apiCallsPerDay: 100,
      mealPlansPerMonth: 1,
      analyticsHistory: 7,
      socialPosts: 2,
    },
    trialDays: 0,
    color: '#6B7280',
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 999,
    priceMonthly: 9.99,
    stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly',
    features: [
      'Todo lo de Free',
      'Alimentos ilimitados',
      'Rutinas ilimitadas',
      'Meal planner semanal',
      'Analytics 90 días',
      'Exportar datos (CSV/PDF)',
      'Challenges ilimitados',
      'Soporte prioritario',
    ],
    limits: {
      dailyFoodLogs: -1,
      savedWorkouts: -1,
      apiCallsPerDay: 10000,
      mealPlansPerMonth: -1,
      analyticsHistory: 90,
      socialPosts: 20,
    },
    trialDays: 7,
    color: '#3B82F6',
    badge: 'Popular',
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 1999,
    priceMonthly: 19.99,
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM || 'price_premium_monthly',
    features: [
      'Todo lo de Pro',
      'Coach virtual con IA',
      'Planes personalizados',
      'Integración wearables',
      'Analytics ilimitado',
      'Workout Builder avanzado',
      'Challenge Creator',
      'API access completo',
      'Soporte 24/7',
    ],
    limits: {
      dailyFoodLogs: -1,
      savedWorkouts: -1,
      apiCallsPerDay: -1,
      mealPlansPerMonth: -1,
      analyticsHistory: -1,
      socialPosts: -1,
    },
    trialDays: 14,
    color: '#8B5CF6',
    badge: 'Best Value',
  },
};

export const getPlanById = (planId: string): SubscriptionPlan => {
  const key = planId.toUpperCase();
  return SUBSCRIPTION_PLANS[key] || SUBSCRIPTION_PLANS.FREE;
};

export const isFeatureAllowed = (
  userRole: string,
  feature: keyof PlanLimits,
  count: number = 1,
): boolean => {
  const plan = getPlanById(userRole);
  const limit = plan.limits[feature];
  if (limit === -1) return true;
  return count <= limit;
};
