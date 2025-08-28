import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, PRICING_PLANS, type PricingPlan } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import { useUserRole } from '../../components/RequireRole';

interface Subscription {
  id: string;
  org_id: string;
  plan: PricingPlan;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_end: string;
  stripe_subscription_id?: string;
  created_at: string;
}

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: userRole } = useUserRole();

  // Fetch current subscription
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', userRole?.orgId],
    queryFn: async () => {
      if (!userRole?.orgId) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('org_id', userRole.orgId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!userRole?.orgId
  });

  // Create checkout session
  const createCheckoutMutation = useMutation({
    mutationFn: async ({ plan, annual }: { plan: PricingPlan, annual: boolean }) => {
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: PRICING_PLANS[plan].priceId,
          isAnnual: annual,
          orgId: userRole?.orgId,
          successUrl: window.location.origin + '/admin/billing?success=true',
          cancelUrl: window.location.origin + '/admin/billing?canceled=true'
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      toast('Failed to start checkout process. Please try again.', 'error');
    }
  });

  // Cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('cancel-subscription', {
        body: { orgId: userRole?.orgId }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast('Subscription canceled successfully. It will remain active until the end of your billing period.', 'success');
    },
    onError: (error) => {
      console.error('Cancel error:', error);
      toast('Failed to cancel subscription. Please contact support.', 'error');
    }
  });

  const handleUpgrade = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    createCheckoutMutation.mutate({ plan, annual: isAnnual });
  };

  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      cancelSubscriptionMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="animate-spin h-8 w-8 mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="container py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Billing & Subscription</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Manage your LeaveHub subscription and billing preferences
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="card mb-8 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-800/30">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-teal-800 dark:text-teal-200">Current Plan</h2>
                <span className={[
                  "px-3 py-1 rounded-full text-sm font-medium",
                  subscription.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                  subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                ].join(' ')}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-teal-700 dark:text-teal-300 mb-2">Plan</h3>
                  <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">
                    {PRICING_PLANS[subscription.plan].name}
                  </p>
                  <p className="text-teal-600 dark:text-teal-400">
                    ${PRICING_PLANS[subscription.plan].price}/month
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-teal-700 dark:text-teal-300 mb-2">Next Billing</h3>
                  <p className="text-teal-800 dark:text-teal-200">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-teal-700 dark:text-teal-300 mb-2">Actions</h3>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelSubscriptionMutation.isPending}
                    className="btn-secondary text-sm"
                  >
                    {cancelSubscriptionMutation.isPending ? 'Canceling...' : 'Cancel Subscription'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setIsAnnual(false)}
              className={[
                "px-4 py-2 rounded-md text-sm font-medium transition",
                !isAnnual ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
              ].join(' ')}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={[
                "px-4 py-2 rounded-md text-sm font-medium transition relative",
                isAnnual ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
              ].join(' ')}
            >
              Annual
              <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                20% off
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(PRICING_PLANS).map(([key, plan]) => {
            const planKey = key as PricingPlan;
            const isCurrentPlan = subscription?.plan === planKey;
            const monthlyPrice = isAnnual ? Math.round(plan.price * 0.8) : plan.price;
            
            return (
              <div
                key={planKey}
                className={[
                  "card relative",
                  plan.popular ? "border-2 border-teal-500 shadow-lg scale-105" : "",
                  isCurrentPlan ? "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700" : ""
                ].join(' ')}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="card-body">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-teal-600 mb-2">
                      ${monthlyPrice}
                      <span className="text-lg text-gray-500">/month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Billed annually (${monthlyPrice * 12}/year)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="text-teal-500 font-bold">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Employees:</span>
                      <span>{plan.limits.employees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span>{plan.limits.storage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Integrations:</span>
                      <span>{plan.limits.integrations}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgrade(planKey)}
                    disabled={isCurrentPlan || createCheckoutMutation.isPending}
                    className={[
                      "btn w-full",
                      isCurrentPlan ? "btn-secondary" : plan.popular ? "btn-primary" : "btn-secondary"
                    ].join(' ')}
                  >
                    {isCurrentPlan ? 'Current Plan' : 
                     createCheckoutMutation.isPending && selectedPlan === planKey ? 'Processing...' : 
                     subscription ? 'Upgrade' : 'Get Started'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate your billing accordingly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens when I cancel?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your subscription remains active until the end of your current billing period. 
                After that, you'll lose access to premium features but your data is preserved.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We offer a 30-day money-back guarantee for new subscriptions. 
                Contact support if you're not satisfied with your purchase.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, we use industry-standard encryption and security practices. 
                Your data is stored securely and never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}