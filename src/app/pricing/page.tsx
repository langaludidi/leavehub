'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Users, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = [
    {
      name: 'Starter',
      icon: Users,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-100',
      users: '1-25 users',
      monthlyPrice: 49,
      annualPrice: 395,
      monthlyNote: 'Starting at R 49/month',
      description: 'Perfect for small teams getting started',
      features: [
        'Basic leave management',
        'BCEA compliance tools',
        'Email notifications',
        'Leave calendar',
        'Mobile access',
        'Basic reporting',
        'Up to 25 employees',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      icon: Crown,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-100',
      users: '5-250 users',
      monthlyPrice: 79,
      annualPrice: 395,
      monthlyNote: 'Starting at R 395/month',
      description: 'Ideal for growing companies',
      features: [
        'Everything in Starter',
        'AI-powered leave planning',
        'Advanced analytics',
        'Workflow automation',
        'Team conflict detection',
        'Custom approval workflows',
        'API access',
        'Priority support',
        'Advanced reporting',
        'Department management',
        'Document management',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      icon: Building2,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-100',
      users: '50-∞ users',
      monthlyPrice: 129,
      annualPrice: 6450,
      monthlyNote: 'Starting at R 6 450/month',
      description: 'For large organizations with complex needs',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security (SSO)',
        'Custom compliance rules',
        'Unlimited API calls',
        'SLA guarantees',
        'On-premise deployment option',
        'White-label branding',
        'Custom training sessions',
        '24/7 phone support',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            LeaveHub Pricing Plans - Affordable Leave
            <br />
            Management for South African Businesses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BCEA-compliant leave management for South African businesses. Start with
            a 14-day free trial, no credit card required.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white rounded-full p-1 border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-teal-700 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'annually'
                  ? 'bg-teal-700 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annually
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative p-8 ${
                  plan.popular
                    ? 'border-2 border-teal-500 shadow-xl'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 ${plan.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.users}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      R {billingCycle === 'monthly' ? plan.monthlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-600">/user/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{plan.monthlyNote}</p>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6">{plan.description}</p>

                {/* CTA Button */}
                <Link href="/sign-up" className="block mb-6">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-teal-700 hover:bg-teal-800 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Get Started Free
                  </Button>
                </Link>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-teal-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="bg-white rounded-2xl p-12 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            All Plans Include
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🇿🇦</div>
              <h3 className="font-semibold text-gray-900 mb-1">BCEA Compliant</h3>
              <p className="text-sm text-gray-600">
                Fully aligned with South African labour law
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-1">Secure & Private</h3>
              <p className="text-sm text-gray-600">
                POPIA-compliant data protection
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-900 mb-1">Mobile Ready</h3>
              <p className="text-sm text-gray-600">
                Access from any device, anywhere
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="font-semibold text-gray-900 mb-1">14-Day Free Trial</h3>
              <p className="text-sm text-gray-600">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
