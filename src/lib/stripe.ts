import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

export { stripePromise };

export const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 5,
    priceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    features: [
      'Up to 25 employees',
      'Basic leave tracking',
      'Email notifications',
      'Mobile app access',
      'Standard support'
    ],
    limits: {
      employees: 25,
      storage: '5GB',
      integrations: 2
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 12,
    priceId: 'price_professional_monthly', // Replace with actual Stripe price ID
    features: [
      'Up to 100 employees',
      'Advanced analytics',
      'Calendar integrations',
      'Custom approval workflows',
      'Priority support',
      'API access'
    ],
    limits: {
      employees: 100,
      storage: '25GB',
      integrations: 10
    },
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 25,
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    features: [
      'Unlimited employees',
      'Custom branding',
      'SSO integration',
      'Advanced reporting',
      'Dedicated support',
      'Custom integrations',
      'Compliance tools'
    ],
    limits: {
      employees: 'unlimited',
      storage: '100GB',
      integrations: 'unlimited'
    }
  }
} as const;

export type PricingPlan = keyof typeof PRICING_PLANS;