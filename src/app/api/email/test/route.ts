import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendTestEmail, sendWelcomeEmail } from '@/lib/email/send';

/**
 * Test email endpoint
 * Send a test email to verify Resend configuration
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, type = 'test' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let result;

    if (type === 'welcome') {
      result = await sendWelcomeEmail('Test User', email);
    } else {
      result = await sendTestEmail(email);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'welcome' ? 'Welcome' : 'Test'} email sent to ${email}`,
      data: result.data,
    });
  } catch (error: any) {
    console.error('Error in email test endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
