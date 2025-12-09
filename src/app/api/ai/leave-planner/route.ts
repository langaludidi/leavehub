import { NextRequest, NextResponse } from 'next/server';
import { anthropic, AI_MODEL, isAIEnabled } from '@/lib/ai/client';
import { createAdminClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { getSouthAfricanHolidays } from '@/lib/utils/south-african-holidays';

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: 'AI features are not enabled. Please set ANTHROPIC_API_KEY.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { startDate, endDate, leaveType, userId, department } = body;

    const supabase = createAdminClient();

    // Get team leave calendar (other approved requests in the same period)
    const { data: teamLeave } = await supabase
      .from('leave_requests')
      .select(`
        start_date,
        end_date,
        working_days,
        profiles!inner (
          first_name,
          last_name,
          department
        )
      `)
      .eq('status', 'approved')
      .eq('profiles.department', department || 'Unknown')
      .gte('end_date', startDate)
      .lte('start_date', endDate) as { data: Array<{
        start_date: string;
        end_date: string;
        working_days: number;
        profiles: { first_name: string; last_name: string; department: string };
      }> | null };

    // Get user's leave balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    const { data: leaveBalance } = await supabase
      .from('leave_balances')
      .select('available_days, entitled_days, used_days, leave_types(name, code)')
      .eq('user_id', profile?.id)
      .eq('year', new Date().getFullYear()) as { data: Array<{
        available_days: number;
        entitled_days: number;
        used_days: number;
        leave_types: { name: string; code: string } | null;
      }> | null };

    // Get upcoming public holidays in the requested period
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allHolidays = getSouthAfricanHolidays(start.getFullYear());
    const holidays = allHolidays.filter(h => {
      const holidayDate = new Date(h.date);
      return holidayDate >= start && holidayDate <= end;
    });

    // Prepare context for AI
    const context = {
      requestedPeriod: {
        startDate: format(start, 'EEEE, d MMMM yyyy'),
        endDate: format(end, 'EEEE, d MMMM yyyy'),
        leaveType,
      },
      teamConflicts: teamLeave?.map(t => ({
        employee: `${t.profiles.first_name} ${t.profiles.last_name}`,
        period: `${format(new Date(t.start_date), 'd MMM')} - ${format(new Date(t.end_date), 'd MMM')}`,
        days: t.working_days,
      })) || [],
      leaveBalance: leaveBalance?.map(lb => ({
        type: lb.leave_types?.name,
        available: lb.available_days,
        entitled: lb.entitled_days,
        used: lb.used_days,
      })) || [],
      publicHolidays: holidays.map(h => ({
        name: h.name,
        date: format(new Date(h.date), 'EEEE, d MMMM yyyy'),
      })),
      currentDate: format(new Date(), 'EEEE, d MMMM yyyy'),
    };

    // Call Claude for AI suggestions
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an AI assistant helping with leave planning in a South African company that follows BCEA (Basic Conditions of Employment Act) regulations.

**Current Context:**
${JSON.stringify(context, null, 2)}

**Task:**
Analyze the requested leave period and provide:

1. **Assessment**: Evaluate if the requested dates are optimal
2. **Conflicts**: Identify any team member conflicts (too many people away at once)
3. **Optimization**: Suggest better date ranges if applicable, especially around public holidays
4. **Recommendations**: Provide 2-3 specific alternative date ranges with reasoning
5. **Balance Check**: Warn if they're using too much leave early in the year

**Response Format (JSON):**
{
  "assessment": {
    "isOptimal": boolean,
    "reason": "Brief explanation"
  },
  "conflicts": [
    {
      "severity": "low|medium|high",
      "description": "What's the conflict",
      "affectedEmployees": ["names"]
    }
  ],
  "suggestions": [
    {
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "reason": "Why this is better",
      "benefits": ["Benefit 1", "Benefit 2"]
    }
  ],
  "balanceWarning": "Warning message if applicable, null otherwise"
}

Respond with ONLY valid JSON, no additional text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse AI response
    let aiSuggestions;
    try {
      aiSuggestions = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'AI returned invalid response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suggestions: aiSuggestions,
      context,
    });

  } catch (error) {
    console.error('Error in AI leave planner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
