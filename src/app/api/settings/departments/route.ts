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

    // Get departments with manager information
    const { data: departments, error } = await supabase
      .from('departments')
      .select(`
        *,
        manager:profiles!departments_manager_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch departments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ departments: departments || [] });

  } catch (error) {
    console.error('Error in departments API:', error);
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

    const { companyId, name, description, managerId } = body;

    if (!companyId || !name) {
      return NextResponse.json(
        { error: 'Company ID and name are required' },
        { status: 400 }
      );
    }

    // Create department
    const { data: department, error } = await supabase
      .from('departments')
      .insert({
        company_id: companyId,
        name,
        description,
        manager_id: managerId || null,
      })
      .select(`
        *,
        manager:profiles!departments_manager_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A department with this name already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating department:', error);
      return NextResponse.json(
        { error: 'Failed to create department' },
        { status: 500 }
      );
    }

    return NextResponse.json({ department }, { status: 201 });

  } catch (error) {
    console.error('Error in departments API:', error);
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

    const { departmentId, name, description, managerId } = body;

    if (!departmentId) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }

    // Update department
    const { data: department, error } = await supabase
      .from('departments')
      .update({
        name,
        description,
        manager_id: managerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', departmentId)
      .select(`
        *,
        manager:profiles!departments_manager_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A department with this name already exists' },
          { status: 409 }
        );
      }
      console.error('Error updating department:', error);
      return NextResponse.json(
        { error: 'Failed to update department' },
        { status: 500 }
      );
    }

    return NextResponse.json({ department });

  } catch (error) {
    console.error('Error in departments API:', error);
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

    const departmentId = searchParams.get('departmentId');

    if (!departmentId) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }

    // Delete department
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', departmentId);

    if (error) {
      console.error('Error deleting department:', error);
      return NextResponse.json(
        { error: 'Failed to delete department' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in departments API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
