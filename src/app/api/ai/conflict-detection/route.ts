import { NextRequest, NextResponse } from 'next/server';
import { anthropic, AI_MODEL, isAIEnabled } from '@/lib/ai/client';
import { createAdminClient } from '@/lib/supabase/server';
import { format, eachDayOfInterval, isWeekend } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        {
          hasConflicts: false,
          message: 'AI conflict detection is not enabled',
          conflicts: [],
        },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { startDate, endDate, userId, department } = body;

    const supabase = createAdminClient();

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, department, job_title')
      .eq('clerk_user_id', userId)
      .single();

    // Get all team members in the same department
    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, job_title')
      .eq('department', profile?.department || department || 'Unknown')
      .neq('id', profile?.id);

    const totalTeamSize = (teamMembers?.length || 0) + 1; // Include current user

    // Get approved and pending leave requests for the team during this period
    const { data: teamLeaveRequests } = await supabase
      .from('leave_requests')
      .select(`
        id,
        start_date,
        end_date,
        working_days,
        status,
        leave_types (
          name,
          code
        ),
        profiles!inner (
          id,
          first_name,
          last_name,
          job_title,
          department
        )
      `)
      .eq('profiles.department', profile?.department || department || 'Unknown')
      .in('status', ['approved', 'pending'])
      .gte('end_date', startDate)
      .lte('start_date', endDate) as { data: Array<{
        id: string;
        start_date: string;
        end_date: string;
        working_days: number;
        status: string;
        leave_types: { name: string; code: string } | null;
        profiles: { id: string; first_name: string; last_name: string; job_title: string; department: string };
      }> | null };

    // Calculate overlap for each day in the requested period
    const requestedDays = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    }).filter(day => !isWeekend(day)); // Only working days

    const dailyAbsences = requestedDays.map(day => {
      const absences = teamLeaveRequests?.filter(leave => {
        const leaveStart = new Date(leave.start_date);
        const leaveEnd = new Date(leave.end_date);
        return day >= leaveStart && day <= leaveEnd;
      }) || [];

      return {
        date: format(day, 'yyyy-MM-dd'),
        dayName: format(day, 'EEEE, d MMMM'),
        absences: absences.map(a => ({
          employee: `${a.profiles.first_name} ${a.profiles.last_name}`,
          jobTitle: a.profiles.job_title,
          leaveType: a.leave_types?.name,
          status: a.status,
        })),
        count: absences.length + 1, // +1 for the current request
        percentageAway: ((absences.length + 1) / totalTeamSize) * 100,
      };
    });

    // Prepare context for AI
    const context = {
      requestedPeriod: {
        startDate: format(new Date(startDate), 'EEEE, d MMMM yyyy'),
        endDate: format(new Date(endDate), 'EEEE, d MMMM yyyy'),
      },
      requester: {
        name: `${profile?.first_name} ${profile?.last_name}`,
        jobTitle: profile?.job_title,
        department: profile?.department,
      },
      team: {
        department: profile?.department || department,
        totalSize: totalTeamSize,
        memberCount: teamMembers?.length || 0,
      },
      dailyAbsences,
      peakAbsenceDay: dailyAbsences.reduce((max, day) =>
        day.count > max.count ? day : max
      , dailyAbsences[0]),
    };

    // Call Claude for conflict analysis
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `You are an AI assistant analyzing team leave conflicts for a South African company.

**Context:**
${JSON.stringify(context, null, 2)}

**Task:**
Analyze if this leave request would create coverage issues for the team. Consider:
1. Team size and percentage of team away
2. Critical roles that might be uncovered
3. Multiple absences on the same days
4. Business continuity risks

**Response Format (JSON):**
{
  "hasConflicts": boolean,
  "severity": "none|low|medium|high|critical",
  "summary": "Brief overall assessment",
  "conflicts": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "Day name",
      "issue": "Description of the conflict",
      "peopleAway": ["List of people"],
      "percentageAway": number,
      "recommendation": "What to do about it"
    }
  ],
  "overallRecommendation": "Should they proceed? Any conditions?"
}

**Rules:**
- Low concern if <30% of team away
- Medium concern if 30-50% of team away
- High concern if >50% of team away
- Critical if all team members away or critical roles uncovered

Respond with ONLY valid JSON, no additional text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'AI returned invalid response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      context,
    });

  } catch (error) {
    console.error('Error in AI conflict detection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
