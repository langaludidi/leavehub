'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Users, Crown, Building2 } from 'lucide-react';
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
      annualPrice: 41,
      annualSavings: 8,
      annualBilling: 492,
      startingAtMonthly: 49,
      startingAtAnnual: 41,
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 25 users',
        '3 user roles',
        '3 integrations',
        '5GB storage',
        'BCEA compliance tools',
        'Leave calendar',
        'Email notifications',
        'Mobile applications',
        'Standard support',
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
      annualPrice: 66,
      annualSavings: 13,
      annualBilling: 3960,
      startingAtMonthly: 330,
      startingAtAnnual: 330,
      description: 'Ideal for growing companies',
      features: [
        'Up to 250 users',
        '4 user roles',
        '10 integrations',
        '50GB storage',
        'Single Sign-On (SSO)',
        'Advanced reporting',
        'Priority support',
        'AI-powered leave planning',
        'Workflow automation',
        'API access',
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
      annualPrice: 107,
      annualSavings: 22,
      annualBilling: 64200,
      startingAtMonthly: 5350,
      startingAtAnnual: 5350,
      description: 'For large organizations with complex needs',
      features: [
        'Unlimited users',
        '5 user roles',
        'Unlimited integrations',
        'Unlimited storage',
        'Single Sign-On (SSO)',
        'Advanced reporting',
        'Priority support',
        'Dedicated success manager',
        'Custom branding',
        'Workflow automation',
        'Custom integrations',
        '24/7 phone support',
      ],
      popular: false,
    },
  ];

  const comparisonFeatures = [
    { name: 'BCEA Compliance', starter: true, professional: true, enterprise: true },
    { name: 'Mobile Applications', starter: true, professional: true, enterprise: true },
    { name: 'Standard Support', starter: true, professional: true, enterprise: true },
    { name: 'Single Sign-On (SSO)', starter: false, professional: true, enterprise: true },
    { name: 'Custom Branding', starter: false, professional: false, enterprise: true },
    { name: 'Advanced Reporting', starter: false, professional: true, enterprise: true },
    { name: 'Priority Support', starter: false, professional: true, enterprise: true },
    { name: 'API Access', starter: false, professional: true, enterprise: true },
    { name: 'Workflow Automation', starter: false, professional: true, enterprise: true },
    { name: 'Dedicated Success Manager', starter: false, professional: false, enterprise: true },
    { name: 'Custom Integrations', starter: false, professional: false, enterprise: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BCEA-compliant leave management for South African businesses. Start with
            a 14-day free trial, no credit card required.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white rounded-full p-1 border border-gray-200 shadow-sm">
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
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                billingCycle === 'annually'
                  ? 'bg-teal-700 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annually
              <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const pricePerUser = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const startingPrice = billingCycle === 'monthly' ? plan.startingAtMonthly : plan.startingAtAnnual;

            return (
              <Card
                key={plan.name}
                className={`relative p-8 ${
                  plan.popular
                    ? 'border-2 border-teal-500 shadow-xl scale-105'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 ${plan.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.users}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">R {pricePerUser}</span>
                    <span className="text-gray-600">/user/month</span>
                  </div>
                  {billingCycle === 'annually' && (
                    <div className="space-y-1">
                      <p className="text-sm text-teal-700 font-medium">
                        Save R {plan.annualSavings}/user/month
                      </p>
                      <p className="text-sm text-gray-500">
                        Billed R {plan.annualBilling.toLocaleString()} annually
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    Starting at R {startingPrice.toLocaleString()}/month
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6">{plan.description}</p>

                {/* CTA Button */}
                <Link href="/sign-up" className="block mb-8">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-teal-700 hover:bg-teal-800 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Start Free Trial
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

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Professional</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">{feature.name}</td>
                    <td className="py-4 px-4 text-center">
                      {feature.starter ? (
                        <Check className="w-5 h-5 text-teal-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {feature.professional ? (
                        <Check className="w-5 h-5 text-teal-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {feature.enterprise ? (
                        <Check className="w-5 h-5 text-teal-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Plans Include */}
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-12 border border-teal-100 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            All Plans Include
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold text-gray-900 mb-1">BCEA Compliant</h3>
              <p className="text-sm text-gray-600">
                100% South African labour law aligned
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-semibold text-gray-900 mb-1">14-Day Free Trial</h3>
              <p className="text-sm text-gray-600">
                No credit card required
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="font-semibold text-gray-900 mb-1">No Setup Fees</h3>
              <p className="text-sm text-gray-600">
                Start immediately, no hidden costs
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">🇿🇦</div>
              <h3 className="font-semibold text-gray-900 mb-1">Made for SA Businesses</h3>
              <p className="text-sm text-gray-600">
                Built with South African needs in mind
              </p>
            </div>
          </div>

          <div className="mt-8 text-center max-w-3xl mx-auto">
            <p className="text-gray-700 leading-relaxed">
              All plans include full BCEA compliance, unlimited leave requests, South African
              public holidays, and dedicated customer support.
            </p>
            <p className="text-gray-700 mt-4 leading-relaxed">
              <strong>🇿🇦 Built for South Africa:</strong> All features designed with South African
              labor law in mind, including BCEA compliance, public holidays, and local business
              practices.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Join hundreds of South African businesses using LeaveHub. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-50 px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
