'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SUBSCRIPTION_PLANS, type SubscriptionPlanCode } from '@/lib/paystack/config';

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  amount: number;
  currency: string;
  current_period_end: string;
  trial_ends_at?: string;
}

interface Company {
  subscription_status: string;
  trial_ends_at?: string;
  max_employees: number;
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();

    // Check for success/error in URL params
    if (searchParams.get('success')) {
      setSuccess('Payment successful! Your subscription is now active.');
      // Remove query params
      router.replace('/dashboard/billing');
    }

    if (searchParams.get('error')) {
      const errorType = searchParams.get('error');
      const errorMessages: Record<string, string> = {
        'no_reference': 'Payment reference missing',
        'payment_failed': 'Payment verification failed',
        'callback_failed': 'Payment callback error',
      };
      setError(errorMessages[errorType] || 'Payment failed. Please try again.');
      router.replace('/dashboard/billing');
    }
  }, [searchParams]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription');

      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }

      const data = await response.json();
      setSubscription(data.subscription);
      setCompany(data.company);
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planCode: SubscriptionPlanCode) => {
    try {
      setProcessingPlan(planCode);
      setError(null);

      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const data = await response.json();

      if (data.success && data.data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(err.message);
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentPlanName = subscription?.plan_name || company?.subscription_status;
  const isTrialing = company?.subscription_status === 'trialing';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Current Subscription Status */}
      {subscription || isTrialing ? (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>

          {isTrialing && !subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-900">Free Trial</p>
                <p className="text-sm text-gray-600 mt-1">
                  Trial ends: {company?.trial_ends_at ? new Date(company.trial_ends_at).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Max employees: {company?.max_employees || 10}
                </p>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Trial
              </div>
            </div>
          ) : subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {subscription.plan_name} Plan
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {subscription.currency} {(subscription.amount / 100).toFixed(2)}/month
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : subscription.status === 'past_due'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Subscription Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">
          {subscription ? 'Upgrade Your Plan' : 'Choose a Plan'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([code, plan]) => {
            const isCurrentPlan = currentPlanName?.toUpperCase() === code;
            const isMostPopular = code === 'PROFESSIONAL';

            return (
              <div
                key={code}
                className={`relative bg-white border-2 rounded-lg p-6 ${
                  isCurrentPlan
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isMostPopular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {isMostPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">
                      R{(plan.amount / 100).toFixed(0)}
                    </span>
                    <span className="ml-2 text-gray-500">/month</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description || `Perfect for ${plan.name.toLowerCase()} teams`}
                  </p>

                  <ul className="space-y-2">
                    {plan.features?.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start text-sm">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    )) || (
                      <>
                        <li className="flex items-start text-sm">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-gray-700">BCEA Compliant</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-gray-700">AI-powered leave planning</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-gray-700">Email notifications</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-gray-700">24/7 Support</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(code as SubscriptionPlanCode)}
                  disabled={isCurrentPlan || processingPlan === code}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : processingPlan === code
                      ? 'bg-blue-400 text-white cursor-wait'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isCurrentPlan
                    ? 'Current Plan'
                    : processingPlan === code
                    ? 'Processing...'
                    : subscription
                    ? 'Upgrade'
                    : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Payment Information</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• All payments are processed securely through Paystack</p>
          <p>• Subscriptions renew automatically on a monthly basis</p>
          <p>• You can cancel your subscription at any time</p>
          <p>• Prices are in South African Rand (ZAR)</p>
        </div>
      </div>
    </div>
  );
}
