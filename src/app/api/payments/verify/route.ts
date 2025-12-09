import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed', details: verifyData },
        { status: 400 }
      );
    }

    // Extract payment metadata
    const metadata = verifyData.data.metadata;
    const customFields = metadata.custom_fields || [];

    const getFieldValue = (variableName: string) => {
      const field = customFields.find((f: any) => f.variable_name === variableName);
      return field?.value || '';
    };

    const planName = getFieldValue('plan_name');
    const planId = getFieldValue('plan_id');
    const billingCycle = getFieldValue('billing_cycle');
    const companyName = getFieldValue('company_name');

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (billingCycle === 'annually') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save subscription to database
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_name: planName,
        plan_id: planId,
        billing_cycle: billingCycle,
        amount: verifyData.data.amount / 100, // Convert from kobo to ZAR
        currency: verifyData.data.currency,
        payment_reference: reference,
        payment_status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        company_name: companyName !== 'N/A' ? companyName : null,
        metadata: verifyData.data,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create subscription', details: dbError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Payment verified and subscription activated',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
