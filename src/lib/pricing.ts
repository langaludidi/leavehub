export interface PricingPlan {
  id: string
  name: string
  displayName: string
  price: number
  maxUsers: number | 'unlimited'
  pricePerEmployee: number
  description: string
  icon: string
  features: string[]
  isPopular?: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    displayName: 'Free Plan',
    price: 0,
    maxUsers: 3,
    pricePerEmployee: 0,
    description: 'Perfect for tiny teams and startups',
    icon: '🆓',
    features: [
      '3 employees included',
      'Basic leave tracking',
      'Simple approval workflow',
      'Email notifications',
      'Basic reporting'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    displayName: 'Starter Plan',
    price: 399,
    maxUsers: 20,
    pricePerEmployee: 20,
    description: 'Perfect for growing teams',
    icon: '🌱',
    features: [
      'Up to 20 employees',
      'Advanced leave policies',
      'Multi-level approvals',
      'Calendar integration',
      'Detailed reporting',
      'Email & SMS notifications'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    displayName: 'Pro Plan',
    price: 849,
    maxUsers: 50,
    pricePerEmployee: 17,
    description: 'Built for SMEs & mid-size companies',
    icon: '🚀',
    features: [
      'Up to 50 employees',
      'Custom leave types',
      'Advanced reporting & analytics',
      'API access',
      'Slack/Teams integration',
      'Priority support',
      'Custom branding'
    ],
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Enterprise Plan',
    price: 2499,
    maxUsers: 'unlimited',
    pricePerEmployee: 5, // At 500 employees: R2499/500 = ~R5/employee
    description: 'Enterprise-grade compliance & scalability',
    icon: '🏢',
    features: [
      'Unlimited employees',
      'Advanced security & compliance',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 premium support',
      'Advanced analytics',
      'Custom workflows',
      'SLA guarantees'
    ]
  }
]

export const getPlanById = (id: string): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.id === id)
}

export const getPlanByName = (name: string): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => 
    plan.name.toLowerCase() === name.toLowerCase() || 
    plan.displayName.toLowerCase() === name.toLowerCase()
  )
}

export const formatPrice = (price: number): string => {
  return `R${price.toLocaleString()}`
}

export const getEffectivePricePerEmployee = (planId: string, employeeCount: number): number => {
  const plan = getPlanById(planId)
  if (!plan) return 0
  
  if (planId === 'free') return 0
  if (planId === 'enterprise') {
    // For enterprise, calculate based on actual usage
    if (employeeCount >= 1000) return 2.5
    if (employeeCount >= 500) return 5
    return plan.pricePerEmployee
  }
  
  return plan.pricePerEmployee
}

export const getPlanRecommendation = (employeeCount: number): PricingPlan => {
  if (employeeCount <= 3) return getPlanById('free')!
  if (employeeCount <= 20) return getPlanById('starter')!
  if (employeeCount <= 50) return getPlanById('professional')!
  return getPlanById('enterprise')!
}