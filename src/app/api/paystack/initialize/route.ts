import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import {
  initializeTransaction,
  createCustomer,
  getCustomerByEmail,
  generateReference,
} from '@/lib/paystack/utils';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode } from '@/lib/paystack/config';

/**
 * Initialize Paystack payment
 * POST /api/paystack/initialize
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan: SubscriptionPlanCode };

    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get user profile and company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, companies(*)')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const planConfig = SUBSCRIPTION_PLANS[plan];
    const reference = generateReference('SUB');

    // Create or get Paystack customer
    let customerCode: string;
    const existingCustomer = await getCustomerByEmail(profile.email);

    if (existingCustomer.success && existingCustomer.data) {
      customerCode = existingCustomer.data.customer_code;
    } else {
      const newCustomer = await createCustomer({
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      });

      if (!newCustomer.success || !newCustomer.data) {
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        );
      }

      customerCode = newCustomer.data.customer_code;

      // Store customer in database
      await supabase.from('paystack_customers').upsert({
        company_id: profile.company_id,
        paystack_customer_code: customerCode,
        paystack_customer_id: newCustomer.data.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
    }

    // Initialize transaction
    const transaction = await initializeTransaction({
      email: profile.email,
      amount: planConfig.amount,
      reference,
      metadata: {
        company_id: profile.company_id,
        user_id: profile.id,
        plan,
        plan_name: planConfig.name,
        customer_code: customerCode,
      },
    });

    if (!transaction.success || !transaction.data) {
      return NextResponse.json(
        { error: transaction.error || 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    // Create payment record
    await supabase.from('payments').insert({
      company_id: profile.company_id,
      paystack_reference: reference,
      paystack_access_code: transaction.data.access_code,
      amount: planConfig.amount,
      currency: planConfig.currency,
      status: 'pending',
      metadata: {
        plan,
        plan_name: planConfig.name,
        customer_code: customerCode,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: transaction.data.authorization_url,
        access_code: transaction.data.access_code,
        reference,
      },
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
