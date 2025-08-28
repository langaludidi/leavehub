import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      return new Response('Missing signature or webhook secret', { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    console.log('Processing Stripe webhook:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Log all events for audit trail
    await logBillingEvent(event)

    return new Response('Webhook processed successfully', { status: 200 })

  } catch (error) {
    console.error('Webhook processing failed:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.org_id
  const plan = session.metadata?.plan
  
  if (!orgId || !plan) {
    console.error('Missing metadata in checkout session')
    return
  }

  // The subscription will be handled by subscription.created webhook
  console.log(`Checkout completed for org ${orgId}, plan: ${plan}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.org_id
  if (!orgId) {
    console.error('Missing org_id in subscription metadata')
    return
  }

  const plan = getPlanFromSubscription(subscription)
  const status = mapStripeStatus(subscription.status)

  // Upsert subscription record
  const { error } = await supabaseClient
    .from('subscriptions')
    .upsert({
      org_id: orgId,
      plan,
      status,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'org_id,status',
      ignoreDuplicates: false
    })

  if (error) {
    console.error('Failed to upsert subscription:', error)
  } else {
    console.log(`Updated subscription for org ${orgId}: ${plan} (${status})`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.org_id
  if (!orgId) return

  // Update subscription status to canceled
  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Failed to cancel subscription:', error)
  } else {
    console.log(`Canceled subscription for org ${orgId}`)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  // Log successful payment
  console.log(`Payment succeeded for subscription ${subscriptionId}`)
  
  // Could add logic here to update usage tracking, send confirmation emails, etc.
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  console.log(`Payment failed for subscription ${subscriptionId}`)
  
  // Could add logic here to notify admins, update status, etc.
}

async function logBillingEvent(event: Stripe.Event) {
  let orgId = null
  let subscriptionId = null
  let amount = null

  // Extract relevant data based on event type
  if (event.data.object && typeof event.data.object === 'object') {
    const obj = event.data.object as any
    
    if (obj.metadata?.org_id) {
      orgId = obj.metadata.org_id
    }
    
    if (obj.amount_paid) {
      amount = obj.amount_paid
    } else if (obj.amount_total) {
      amount = obj.amount_total
    }
    
    // Try to find subscription record to get org_id
    if (obj.subscription && !orgId) {
      const { data } = await supabaseClient
        .from('subscriptions')
        .select('id, org_id')
        .eq('stripe_subscription_id', obj.subscription)
        .single()
      
      if (data) {
        orgId = data.org_id
        subscriptionId = data.id
      }
    }
  }

  if (orgId) {
    await supabaseClient
      .from('billing_events')
      .insert({
        org_id: orgId,
        subscription_id: subscriptionId,
        event_type: event.type,
        stripe_event_id: event.id,
        amount,
        status: 'processed',
        metadata: event.data.object
      })
  }
}

function getPlanFromSubscription(subscription: Stripe.Subscription): string {
  // Get plan from the price ID
  const priceId = subscription.items.data[0]?.price.id
  if (!priceId) return 'starter'
  
  if (priceId.includes('professional')) return 'professional'
  if (priceId.includes('enterprise')) return 'enterprise'
  return 'starter'
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  const statusMap: Record<string, string> = {
    'active': 'active',
    'canceled': 'canceled',
    'incomplete': 'incomplete',
    'incomplete_expired': 'canceled',
    'past_due': 'past_due',
    'paused': 'canceled',
    'trialing': 'trialing',
    'unpaid': 'past_due'
  }
  
  return statusMap[status] || status
}