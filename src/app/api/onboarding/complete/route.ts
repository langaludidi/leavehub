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

    // Create default BCEA-compliant leave types for the company
    const { error: leaveTypesError } = await supabase.rpc(
      'create_default_leave_types_for_company',
      { company_uuid: company.id }
    );

    if (leaveTypesError) {
      console.error('Error creating default leave types:', leaveTypesError);
      // Don't fail onboarding if leave types fail - they can be added later
    } else {
      console.log('✓ Default leave types created for company');
    }

    // Initialize leave balances for the first user
    const { error: balancesError } = await supabase.rpc(
      'initialize_employee_leave_balances',
      {
        employee_uuid: (await supabase.from('profiles').select('id').eq('clerk_user_id', userId).single()).data?.id,
        company_uuid: company.id,
        hire_date: new Date().toISOString().split('T')[0]
      }
    );

    if (balancesError) {
      console.error('Error initializing leave balances:', balancesError);
    } else {
      console.log('✓ Leave balances initialized for user');
    }

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
