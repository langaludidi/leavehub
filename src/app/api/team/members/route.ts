import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const managerId = searchParams.get('managerId');
    const departmentId = searchParams.get('departmentId');

    if (!managerId && !departmentId) {
      return NextResponse.json(
        { error: 'Manager ID or Department ID is required' },
        { status: 400 }
      );
    }

    // Get manager's profile to find their company and department
    let companyId: string | null = null;
    let managerDepartmentId: string | null = null;

    if (managerId) {
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('company_id, department_id')
        .eq('clerk_user_id', managerId)
        .single();

      if (managerProfile) {
        companyId = managerProfile.company_id;
        managerDepartmentId = managerProfile.department_id;
      }
    }

    // Build query for team members
    let query = supabase
      .from('profiles')
      .select(`
        id,
        clerk_user_id,
        email,
        first_name,
        last_name,
        role,
        department_id,
        department:departments(
          id,
          name
        )
      `);

    // Filter by department if manager has a department or department ID is provided
    const filterDepartmentId = departmentId || managerDepartmentId;
    if (filterDepartmentId) {
      query = query.eq('department_id', filterDepartmentId);
    } else if (companyId) {
      // If no department, show all company members
      query = query.eq('company_id', companyId);
    }

    const { data: members, error } = await query.order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching team members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      );
    }

    // Get leave balances for each member
    const membersWithBalances = await Promise.all(
      (members || []).map(async (member) => {
        const { data: balances } = await supabase
          .from('leave_balances')
          .select(`
            id,
            year,
            entitled_days,
            used_days,
            available_days,
            leave_type:leave_types(
              id,
              name,
              code,
              color
            )
          `)
          .eq('user_id', member.id)
          .eq('year', new Date().getFullYear());

        return {
          ...member,
          leave_balances: balances || [],
        };
      })
    );

    return NextResponse.json({ members: membersWithBalances });

  } catch (error) {
    console.error('Error in team members API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
