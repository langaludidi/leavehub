import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Complete user onboarding - create company and profile
 * POST /api/onboarding/complete
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, industry, companySize } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 400 }
      );
    }

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        industry: industry || null,
        size: companySize || null,
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        max_employees: 10, // Starter plan limit during trial
      })
      .select()
      .single();

    if (companyError || !company) {
      console.error('Error creating company:', companyError);
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      );
    }

    console.log('✓ Company created:', company.id);

    // Create profile for the user as super_admin (first user)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        clerk_user_id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        first_name: user.firstName || null,
        last_name: user.lastName || null,
        role: 'super_admin', // First user is super admin
        company_id: company.id,
        department: null,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);

      // Rollback: delete the company
      await supabase.from('companies').delete().eq('id', company.id);

      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    console.log('✓ Profile created for user:', userId);

    // TODO: Send welcome email here if needed

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
      },
    });
  } catch (error: any) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
