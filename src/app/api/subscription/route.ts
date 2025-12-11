import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get current user's subscription and company data
 * GET /api/subscription
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get user profile with company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('subscription_status, trial_ends_at, max_employees')
      .eq('id', profile.company_id)
      .single();

    if (companyError) {
      console.error('Error fetching company:', companyError);
    }

    // Get active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', profile.company_id)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
    }

    return NextResponse.json({
      success: true,
      subscription,
      company,
    });
  } catch (error: any) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
