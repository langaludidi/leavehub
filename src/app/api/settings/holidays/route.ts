import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('companyId');
    const year = searchParams.get('year');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('public_holidays')
      .select('*')
      .eq('company_id', companyId)
      .order('date', { ascending: true });

    // Filter by year if provided
    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data: holidays, error } = await query;

    if (error) {
      console.error('Error fetching public holidays:', error);
      return NextResponse.json(
        { error: 'Failed to fetch public holidays' },
        { status: 500 }
      );
    }

    return NextResponse.json({ holidays: holidays || [] });

  } catch (error) {
    console.error('Error in public holidays API:', error);
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

    const { companyId, name, date, isRecurring } = body;

    if (!companyId || !name || !date) {
      return NextResponse.json(
        { error: 'Company ID, name, and date are required' },
        { status: 400 }
      );
    }

    // Create public holiday
    const { data: holiday, error } = await supabase
      .from('public_holidays')
      .insert({
        company_id: companyId,
        name,
        date,
        is_recurring: isRecurring || false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A holiday on this date already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating public holiday:', error);
      return NextResponse.json(
        { error: 'Failed to create public holiday' },
        { status: 500 }
      );
    }

    return NextResponse.json({ holiday }, { status: 201 });

  } catch (error) {
    console.error('Error in public holidays API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const { holidayId, name, date, isRecurring } = body;

    if (!holidayId) {
      return NextResponse.json(
        { error: 'Holiday ID is required' },
        { status: 400 }
      );
    }

    // Update public holiday
    const { data: holiday, error } = await supabase
      .from('public_holidays')
      .update({
        name,
        date,
        is_recurring: isRecurring,
        updated_at: new Date().toISOString(),
      })
      .eq('id', holidayId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A holiday on this date already exists' },
          { status: 409 }
        );
      }
      console.error('Error updating public holiday:', error);
      return NextResponse.json(
        { error: 'Failed to update public holiday' },
        { status: 500 }
      );
    }

    return NextResponse.json({ holiday });

  } catch (error) {
    console.error('Error in public holidays API:', error);
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

    const holidayId = searchParams.get('holidayId');

    if (!holidayId) {
      return NextResponse.json(
        { error: 'Holiday ID is required' },
        { status: 400 }
      );
    }

    // Delete public holiday
    const { error } = await supabase
      .from('public_holidays')
      .delete()
      .eq('id', holidayId);

    if (error) {
      console.error('Error deleting public holiday:', error);
      return NextResponse.json(
        { error: 'Failed to delete public holiday' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in public holidays API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
