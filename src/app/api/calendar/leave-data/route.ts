import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId');
    const filter = searchParams.get('filter') || 'all'; // all, my-team, my-leaves
    const status = searchParams.get('status'); // pending, approved, rejected
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile to determine team/department
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, company_id, department, role')
      .eq('clerk_user_id', userId)
      .single();

    // Build query based on filter
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        leave_types (
          name,
          code,
          color
        ),
        profiles (
          first_name,
          last_name,
          email,
          department
        )
      `)
      .order('start_date', { ascending: true });

    // Apply filter logic
    if (filter === 'my-leaves' && userProfile) {
      // Only user's own leave requests
      query = query.eq('user_id', userProfile.id);
    } else if (filter === 'my-team' && userProfile) {
      // Leave requests from same department
      if (userProfile.department) {
        // First get all profiles in the same department
        const { data: teamProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('department', userProfile.department)
          .eq('company_id', userProfile.company_id);

        if (teamProfiles && teamProfiles.length > 0) {
          const teamIds = teamProfiles.map(p => p.id);
          query = query.in('user_id', teamIds);
        }
      }
    } else if (filter === 'all' && userProfile) {
      // All leave requests in the company
      const { data: companyProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', userProfile.company_id);

      if (companyProfiles && companyProfiles.length > 0) {
        const companyIds = companyProfiles.map(p => p.id);
        query = query.in('user_id', companyIds);
      }
    }

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply date range filter if provided
    if (startDate) {
      query = query.gte('end_date', startDate);
    }
    if (endDate) {
      query = query.lte('start_date', endDate);
    }

    const { data: leaveRequests, error } = await query;

    if (error) {
      console.error('Error fetching calendar data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar data' },
        { status: 500 }
      );
    }

    // If no profile found, return demo data for development
    if (!userProfile) {
      console.warn('No user profile found, returning demo data');
      const demoLeaveRequests = [
        {
          id: '1',
          user_id: '12345678-1234-1234-1234-123456789012',
          start_date: '2025-12-23',
          end_date: '2025-12-27',
          working_days: 3,
          status: 'approved',
          reason: 'Christmas holiday',
          leave_types: {
            name: 'Annual Leave',
            code: 'ANN',
            color: '#0D9488'
          },
          profiles: {
            first_name: 'Demo',
            last_name: 'User',
            email: 'demo@leavehub.com',
            department: 'Engineering'
          }
        },
        {
          id: '2',
          user_id: '12345678-1234-1234-1234-123456789012',
          start_date: '2025-10-15',
          end_date: '2025-10-16',
          working_days: 2,
          status: 'pending',
          reason: 'Medical appointment',
          leave_types: {
            name: 'Sick Leave',
            code: 'SICK',
            color: '#EF4444'
          },
          profiles: {
            first_name: 'Demo',
            last_name: 'User',
            email: 'demo@leavehub.com',
            department: 'Engineering'
          }
        },
        {
          id: '3',
          user_id: 'team-member-1',
          start_date: '2025-11-10',
          end_date: '2025-11-14',
          working_days: 5,
          status: 'approved',
          reason: 'Family vacation',
          leave_types: {
            name: 'Annual Leave',
            code: 'ANN',
            color: '#0D9488'
          },
          profiles: {
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@leavehub.com',
            department: 'Engineering'
          }
        },
        {
          id: '4',
          user_id: 'team-member-2',
          start_date: '2025-11-01',
          end_date: '2025-11-03',
          working_days: 2,
          status: 'approved',
          reason: 'Personal matters',
          leave_types: {
            name: 'Family Responsibility',
            code: 'FAM',
            color: '#F59E0B'
          },
          profiles: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@leavehub.com',
            department: 'Engineering'
          }
        }
      ];

      return NextResponse.json({
        leaveRequests: demoLeaveRequests,
        isDemoData: true
      });
    }

    return NextResponse.json({
      leaveRequests: leaveRequests || [],
      isDemoData: false
    });

  } catch (error) {
    console.error('Error in calendar data API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
