import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyWebhookSignature, verifyTransaction, createSubscription } from '@/lib/paystack/utils';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack/config';

/**
 * Handle Paystack webhooks
 * POST /api/paystack/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature');
    const body = await request.text();

    // Verify webhook signature
    if (!signature || !verifyWebhookSignature(signature, body)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = createAdminClient();

    // Log webhook event
    await supabase.from('paystack_webhooks').insert({
      event_type: event.event,
      paystack_event_id: event.id,
      payload: event,
      processed: false,
    });

    console.log('Paystack webhook received:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data, supabase);
        break;

      case 'subscription.create':
        await handleSubscriptionCreate(event.data, supabase);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisable(event.data, supabase);
        break;

      case 'subscription.not_renew':
        await handleSubscriptionNotRenew(event.data, supabase);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data, supabase);
        break;

      default:
        console.log('Unhandled event type:', event.event);
    }

    // Mark webhook as processed
    await supabase
      .from('paystack_webhooks')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('paystack_event_id', event.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleChargeSuccess(data: any, supabase: any) {
  const reference = data.reference;

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'success',
      paystack_transaction_id: data.id,
      paid_at: data.paid_at,
      channel: data.channel,
      fees: data.fees,
      ip_address: data.ip_address,
    })
    .eq('paystack_reference', reference);

  // Get payment metadata
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('paystack_reference', reference)
    .single();

  if (!payment || !payment.metadata) return;

  const { plan, customer_code } = payment.metadata;

  // Create subscription if plan is selected
  if (plan && customer_code) {
    const authorization = data.authorization.authorization_code;

    const subscriptionResult = await createSubscription({
      customer: customer_code,
      plan,
      authorization,
    });

    if (subscriptionResult.success && subscriptionResult.data) {
      const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];

      // Create subscription record
      await supabase.from('subscriptions').insert({
        company_id: payment.company_id,
        plan_name: plan,
        plan_code: planConfig.code,
        status: 'active',
        paystack_subscription_code: subscriptionResult.data.subscription_code,
        paystack_customer_code: customer_code,
        paystack_email_token: subscriptionResult.data.email_token,
        amount: planConfig.amount,
        currency: planConfig.currency,
        interval: planConfig.interval,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Update company subscription status
      await supabase
        .from('companies')
        .update({ subscription_status: 'active' })
        .eq('id', payment.company_id);

      // Update payment with subscription_id
      const { data: newSubscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('paystack_subscription_code', subscriptionResult.data.subscription_code)
        .single();

      if (newSubscription) {
        await supabase
          .from('payments')
          .update({ subscription_id: newSubscription.id })
          .eq('paystack_reference', reference);
      }
    }
  }
}

async function handleSubscriptionCreate(data: any, supabase: any) {
  console.log('Subscription created:', data.subscription_code);
  // Additional subscription creation logic if needed
}

async function handleSubscriptionDisable(data: any, supabase: any) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('paystack_subscription_code', data.subscription_code);

  // Update company subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('company_id')
    .eq('paystack_subscription_code', data.subscription_code)
    .single();

  if (subscription) {
    await supabase
      .from('companies')
      .update({ subscription_status: 'canceled' })
      .eq('id', subscription.company_id);
  }
}

async function handleSubscriptionNotRenew(data: any, supabase: any) {
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('paystack_subscription_code', data.subscription_code);
}

async function handlePaymentFailed(data: any, supabase: any) {
  // Update payment status
  await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('paystack_reference', data.reference);

  // Update subscription status
  if (data.subscription_code) {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('paystack_subscription_code', data.subscription_code);
  }
}
