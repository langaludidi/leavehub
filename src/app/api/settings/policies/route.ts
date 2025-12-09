import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('companyId');
    const leaveTypeId = searchParams.get('leaveTypeId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('leave_policy_settings')
      .select(`
        *,
        leave_type:leave_types(
          id,
          name,
          code,
          color,
          description
        )
      `)
      .eq('company_id', companyId);

    // Filter by leave type if provided
    if (leaveTypeId) {
      query = query.eq('leave_type_id', leaveTypeId);
    }

    const { data: policies, error } = await query;

    if (error) {
      console.error('Error fetching leave policies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leave policies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ policies: policies || [] });

  } catch (error) {
    console.error('Error in leave policies API:', error);
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
      leaveTypeId,
      defaultDays,
      maxDays,
      minDays,
      accrualType,
      accrualRate,
      allowCarryover,
      maxCarryoverDays,
      carryoverExpiryMonths,
      minNoticeDays,
      maxConsecutiveDays,
      requiresApproval,
      requiresDocumentation,
      allowNegativeBalance,
      allowHalfDays,
      excludeWeekends,
      excludePublicHolidays,
    } = body;

    if (!companyId || !leaveTypeId) {
      return NextResponse.json(
        { error: 'Company ID and leave type ID are required' },
        { status: 400 }
      );
    }

    // Upsert leave policy settings
    const { data: policy, error } = await supabase
      .from('leave_policy_settings')
      .upsert({
        company_id: companyId,
        leave_type_id: leaveTypeId,
        default_days: defaultDays,
        max_days: maxDays,
        min_days: minDays,
        accrual_type: accrualType,
        accrual_rate: accrualRate,
        allow_carryover: allowCarryover,
        max_carryover_days: maxCarryoverDays,
        carryover_expiry_months: carryoverExpiryMonths,
        min_notice_days: minNoticeDays,
        max_consecutive_days: maxConsecutiveDays,
        requires_approval: requiresApproval,
        requires_documentation: requiresDocumentation,
        allow_negative_balance: allowNegativeBalance,
        allow_half_days: allowHalfDays,
        exclude_weekends: excludeWeekends,
        exclude_public_holidays: excludePublicHolidays,
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        leave_type:leave_types(
          id,
          name,
          code,
          color,
          description
        )
      `)
      .single();

    if (error) {
      console.error('Error saving leave policy:', error);
      return NextResponse.json(
        { error: 'Failed to save leave policy' },
        { status: 500 }
      );
    }

    return NextResponse.json({ policy });

  } catch (error) {
    console.error('Error in leave policies API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const policyId = searchParams.get('policyId');

    if (!policyId) {
      return NextResponse.json(
        { error: 'Policy ID is required' },
        { status: 400 }
      );
    }

    // Delete leave policy
    const { error } = await supabase
      .from('leave_policy_settings')
      .delete()
      .eq('id', policyId);

    if (error) {
      console.error('Error deleting leave policy:', error);
      return NextResponse.json(
        { error: 'Failed to delete leave policy' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in leave policies API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
