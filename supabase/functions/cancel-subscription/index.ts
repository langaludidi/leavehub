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

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt)
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { orgId } = await req.json()

    // Verify user has admin role for the organization
    const { data: orgMember, error: memberError } = await supabaseClient
      .from('org_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', orgId)
      .eq('role', 'admin')
      .eq('active', true)
      .single()

    if (memberError || !orgMember) {
      return new Response('Forbidden: Admin access required', { status: 403 })
    }

    // Get current active subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return new Response('No active subscription found', { status: 404 })
    }

    if (!subscription.stripe_subscription_id) {
      return new Response('No Stripe subscription ID found', { status: 400 })
    }

    // Cancel the subscription at period end in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
        metadata: {
          canceled_by: user.id,
          canceled_at: new Date().toISOString()
        }
      }
    )

    // Update our database
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({ 
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Database update failed:', updateError)
      // Note: Stripe has been updated, but our DB update failed
      // This should be handled by webhook as backup
    }

    // Log the cancellation event
    await supabaseClient
      .from('billing_events')
      .insert({
        org_id: orgId,
        subscription_id: subscription.id,
        event_type: 'subscription.cancel_requested',
        metadata: {
          canceled_by: user.id,
          stripe_subscription_id: subscription.stripe_subscription_id,
          cancel_at_period_end: true
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription will be canceled at the end of the current billing period',
        current_period_end: updatedSubscription.current_period_end
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Subscription cancellation failed:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to cancel subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})