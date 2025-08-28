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
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Get JWT from Authorization header
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt)
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { priceId, isAnnual, orgId, successUrl, cancelUrl } = await req.json()

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

    // Get organization info
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return new Response('Organization not found', { status: 404 })
    }

    // Check if org already has a Stripe customer
    let customerId: string | null = null
    const { data: existingSub } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('org_id', orgId)
      .maybeSingle()

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id
    }

    // Create or update Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: {
          org_id: orgId,
          user_id: user.id
        }
      })
      customerId = customer.id
    }

    // Determine the actual price ID (adjust for annual billing if needed)
    let actualPriceId = priceId
    if (isAnnual) {
      // Map monthly price IDs to annual equivalents
      const annualPriceMap: Record<string, string> = {
        'price_starter_monthly': 'price_starter_annual',
        'price_professional_monthly': 'price_professional_annual', 
        'price_enterprise_monthly': 'price_enterprise_annual'
      }
      actualPriceId = annualPriceMap[priceId] || priceId
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: actualPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        org_id: orgId,
        user_id: user.id,
        plan: getPlanFromPriceId(actualPriceId)
      },
      subscription_data: {
        metadata: {
          org_id: orgId,
          user_id: user.id,
        },
        trial_period_days: 14, // 14-day free trial
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Checkout session creation failed:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function getPlanFromPriceId(priceId: string): string {
  if (priceId.includes('starter')) return 'starter'
  if (priceId.includes('professional')) return 'professional'  
  if (priceId.includes('enterprise')) return 'enterprise'
  return 'starter' // default fallback
}