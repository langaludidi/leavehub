import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Check if the current user has a profile
 * GET /api/profile/check
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, company_id, role')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking profile:', error);
      return NextResponse.json(
        { error: 'Failed to check profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasProfile: !!profile,
      profile: profile || null,
    });
  } catch (error: any) {
    console.error('Profile check error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
