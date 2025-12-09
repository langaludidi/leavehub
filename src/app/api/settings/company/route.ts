import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get company settings
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching company settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch company settings' },
        { status: 500 }
      );
    }

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        settings: {
          company_id: companyId,
          fiscal_year_start_month: 1,
          working_days: [1, 2, 3, 4, 5],
          working_hours_per_day: 8.0,
          timezone: 'Africa/Johannesburg',
          auto_approve_after_days: null,
          allow_overlapping_requests: false,
          require_handover_notes: false,
          notify_managers: true,
          notify_hr: true,
          reminder_days_before: 3,
          approval_levels: 1,
          require_hr_approval: false,
        },
      });
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Error in company settings API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const {
      companyId,
      fiscal_year_start_month,
      working_days,
      working_hours_per_day,
      timezone,
      auto_approve_after_days,
      allow_overlapping_requests,
      require_handover_notes,
      notify_managers,
      notify_hr,
      reminder_days_before,
      approval_levels,
      require_hr_approval,
    } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Upsert company settings
    const { data: settings, error } = await supabase
      .from('company_settings')
      .upsert({
        company_id: companyId,
        fiscal_year_start_month,
        working_days,
        working_hours_per_day,
        timezone,
        auto_approve_after_days,
        allow_overlapping_requests,
        require_handover_notes,
        notify_managers,
        notify_hr,
        reminder_days_before,
        approval_levels,
        require_hr_approval,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error saving company settings:', error);
      return NextResponse.json(
        { error: 'Failed to save company settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Error in company settings API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
