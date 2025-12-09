import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/roles';
import { requireRole } from '@/lib/auth/roles';

/**
 * Update user role (Admin/Super Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify authentication
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Require admin role
    await requireRole(UserRole.ADMIN);

    // Get target user ID from params
    const { userId: targetUserId } = await params;

    // Get new role from request body
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: employee, manager, hr_admin, admin, super_admin' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user's role to prevent unauthorized escalation
    const { data: currentUserData } = await supabase
      .from('profiles')
      .select('role')
      .eq('clerk_user_id', currentUserId)
      .single();

    const currentUserRole = currentUserData?.role as UserRole;

    // Prevent non-super-admins from creating super admins
    if (role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Only Super Admins can assign Super Admin role' },
        { status: 403 }
      );
    }

    // Prevent users from changing their own role
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 403 }
      );
    }

    // Update the user's role
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', targetUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (error: any) {
    console.error('Error in role update:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Required role')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get user role (for verification)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: targetUserId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('role, first_name, last_name, email, department')
      .eq('clerk_user_id', targetUserId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error in role fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
