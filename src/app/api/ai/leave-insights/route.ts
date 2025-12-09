import { NextRequest, NextResponse } from 'next/server';
import { anthropic, AI_MODEL, isAIEnabled } from '@/lib/ai/client';
import { createAdminClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        {
          insights: [],
          message: 'AI insights are not enabled',
        },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { userId, year } = body;

    const currentYear = year || new Date().getFullYear();
    const supabase = createAdminClient();

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, department')
      .eq('clerk_user_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's leave history (current year and previous year)
    const { data: leaveHistory } = await supabase
      .from('leave_requests')
      .select(`
        id,
        start_date,
        end_date,
        working_days,
        status,
        created_at,
        leave_types (
          name,
          code
        )
      `)
      .eq('user_id', profile.id)
      .gte('start_date', `${currentYear - 1}-01-01`)
      .order('start_date', { ascending: true }) as { data: Array<{
        id: string;
        start_date: string;
        end_date: string;
        working_days: number;
        status: string;
        created_at: string;
        leave_types: { name: string; code: string } | null;
      }> | null };

    // Get user's leave balances
    const { data: leaveBalances } = await supabase
      .from('leave_balances')
      .select(`
        available_days,
        used_days,
        entitled_days,
        year,
        leave_types (
          name,
          code
        )
      `)
      .eq('user_id', profile.id)
      .eq('year', currentYear) as { data: Array<{
        available_days: number;
        used_days: number;
        entitled_days: number;
        year: number;
        leave_types: { name: string; code: string } | null;
      }> | null };

    // Get department average leave usage
    const { data: deptLeaveStats } = await supabase
      .from('leave_requests')
      .select(`
        working_days,
        profiles!inner (
          department
        )
      `)
      .eq('profiles.department', profile.department)
      .eq('status', 'approved')
      .gte('start_date', `${currentYear}-01-01`);

    // Calculate statistics
    const stats = {
      totalLeaveTaken: leaveHistory
        ?.filter(l => l.status === 'approved' && new Date(l.start_date).getFullYear() === currentYear)
        .reduce((sum, l) => sum + l.working_days, 0) || 0,

      totalLeaveRequests: leaveHistory?.filter(l =>
        new Date(l.start_date).getFullYear() === currentYear
      ).length || 0,

      approvedRequests: leaveHistory?.filter(l =>
        l.status === 'approved' && new Date(l.start_date).getFullYear() === currentYear
      ).length || 0,

      rejectedRequests: leaveHistory?.filter(l =>
        l.status === 'rejected' && new Date(l.start_date).getFullYear() === currentYear
      ).length || 0,

      pendingRequests: leaveHistory?.filter(l =>
        l.status === 'pending' && new Date(l.start_date).getFullYear() === currentYear
      ).length || 0,

      leaveByType: (leaveHistory
        ?.filter(l => l.status === 'approved' && new Date(l.start_date).getFullYear() === currentYear)
        ?.reduce((acc, l) => {
          const type = l.leave_types?.name || 'Other';
          acc[type] = (acc[type] || 0) + l.working_days;
          return acc;
        }, {} as Record<string, number>)) || {},

      leaveByMonth: (leaveHistory
        ?.filter(l => l.status === 'approved' && new Date(l.start_date).getFullYear() === currentYear)
        ?.reduce((acc, l) => {
          const month = format(new Date(l.start_date), 'MMMM');
          acc[month] = (acc[month] || 0) + l.working_days;
          return acc;
        }, {} as Record<string, number>)) || {},

      averageRequestDuration: (leaveHistory
        ?.filter(l => l.status === 'approved' && new Date(l.start_date).getFullYear() === currentYear)
        ?.reduce((sum, l) => sum + l.working_days, 0) ?? 0) / (leaveHistory?.filter(l => l.status === 'approved' && new Date(l.start_date).getFullYear() === currentYear).length || 1),

      departmentAverage: (deptLeaveStats
        ?.reduce((sum, l) => sum + l.working_days, 0) ?? 0) / (deptLeaveStats?.length || 1),
    };

    // Prepare context for AI
    const context = {
      user: {
        name: `${profile.first_name} ${profile.last_name}`,
        department: profile.department,
      },
      currentYear,
      statistics: stats,
      leaveBalances: leaveBalances?.map(lb => ({
        type: lb.leave_types?.name,
        available: lb.available_days,
        used: lb.used_days,
        entitled: lb.entitled_days,
        percentageUsed: ((lb.used_days / lb.entitled_days) * 100).toFixed(1),
      })) || [],
      recentLeavePattern: leaveHistory?.slice(-5).map(l => ({
        dates: `${format(new Date(l.start_date), 'd MMM')} - ${format(new Date(l.end_date), 'd MMM')}`,
        type: l.leave_types?.name,
        days: l.working_days,
        status: l.status,
      })) || [],
    };

    // Call Claude for insights
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an AI assistant analyzing leave patterns for employees at a South African company.

**Context:**
${JSON.stringify(context, null, 2)}

**Task:**
Analyze the employee's leave usage patterns and provide personalized insights. Consider:
1. Leave balance usage (are they on track, using too much/little?)
2. Distribution across the year (clustering, spread out, etc.)
3. Comparison to department average
4. Pattern trends (consistent, sporadic, etc.)
5. Recommendations for remaining leave

**Response Format (JSON):**
{
  "insights": [
    {
      "type": "positive|warning|neutral|recommendation",
      "title": "Insight title",
      "description": "Detailed explanation",
      "action": "Optional: What the employee should do"
    }
  ],
  "summary": "Overall assessment of leave usage",
  "recommendations": [
    "Specific actionable recommendation"
  ],
  "healthScore": {
    "score": number (0-100),
    "label": "excellent|good|fair|concerning",
    "reasoning": "Why this score"
  }
}

**Guidelines:**
- Be encouraging and positive
- Highlight good work-life balance
- Warn if they're overworking (not taking enough leave)
- Suggest optimal times to use remaining leave
- Consider BCEA compliance (employees should use their leave)
- Compare to department norms

Respond with ONLY valid JSON, no additional text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse AI response
    let aiInsights;
    try {
      aiInsights = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'AI returned invalid response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      insights: aiInsights,
      statistics: stats,
      context,
    });

  } catch (error) {
    console.error('Error in AI leave insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
