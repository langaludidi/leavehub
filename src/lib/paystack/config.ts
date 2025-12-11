import Paystack from 'paystack-node';

// Initialize Paystack with secret key
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
}

if (!PAYSTACK_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not defined in environment variables');
}

// Initialize Paystack client
export const paystack = new Paystack(PAYSTACK_SECRET_KEY);

// Paystack configuration
export const paystackConfig = {
  secretKey: PAYSTACK_SECRET_KEY,
  publicKey: PAYSTACK_PUBLIC_KEY,
  callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/callback`,
  webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/webhook`,
};

// Subscription plan codes (to be created in Paystack dashboard)
export const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: 'Starter',
    code: 'PLN_starter',
    amount: 29900, // R299 in kobo/cents
    interval: 'monthly' as const,
    currency: 'ZAR' as const,
    features: [
      'Up to 10 employees',
      'Basic leave management',
      'Email notifications',
      'BCEA compliance',
      'Mobile responsive',
    ],
  },
  PROFESSIONAL: {
    name: 'Professional',
    code: 'PLN_professional',
    amount: 79900, // R799 in kobo/cents
    interval: 'monthly' as const,
    currency: 'ZAR' as const,
    features: [
      'Up to 50 employees',
      'Advanced analytics',
      'AI-powered insights',
      'Priority support',
      'Custom leave types',
      'Document management',
      'All Starter features',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    code: 'PLN_enterprise',
    amount: 199900, // R1,999 in kobo/cents
    interval: 'monthly' as const,
    currency: 'ZAR' as const,
    features: [
      'Unlimited employees',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced reporting',
      'API access',
      'White-label option',
      'All Professional features',
    ],
  },
} as const;

export type SubscriptionPlanCode = keyof typeof SUBSCRIPTION_PLANS;
