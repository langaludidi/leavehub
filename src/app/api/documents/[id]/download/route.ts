import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
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

    // Get document to verify ownership
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', profile.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Download from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path);

    if (downloadError || !fileData) {
      console.error('Storage download error:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      );
    }

    // Return file as blob
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': document.file_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${document.filename}"`,
      },
    });
  } catch (error) {
    console.error('Download document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
