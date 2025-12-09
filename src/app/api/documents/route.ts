import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Fetch user's documents
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch documents error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      documents: documents || [],
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
