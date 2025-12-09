import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/roles';

/**
 * Ensures a profile exists for the current user
 * Creates one if it doesn't exist (fallback for webhook setup)
 */
export async function ensureProfileExists(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return false;
    }

    const supabase = createServerClient();

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (existingProfile) {
      // Profile exists, no action needed
      return true;
    }

    // Profile doesn't exist, create it (fallback)
    const user = await currentUser();
    if (!user) {
      return false;
    }

    const demoCompanyId = '12345678-1234-1234-1234-123456789000';

    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        clerk_user_id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        first_name: user.firstName || null,
        last_name: user.lastName || null,
        role: UserRole.EMPLOYEE, // Default to employee
        company_id: demoCompanyId,
        department: null,
      });

    if (insertError) {
      console.error('Error creating fallback profile:', insertError);
      return false;
    }

    console.log('✓ Fallback profile created for user:', userId);
    return true;
  } catch (error) {
    console.error('Error in ensureProfileExists:', error);
    return false;
  }
}
