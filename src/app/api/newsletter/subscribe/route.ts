import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resend } from '@/lib/email/resend';

/**
 * Newsletter subscription endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already subscribed!' },
        { status: 400 }
      );
    }

    // Add to newsletter subscribers table
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        subscribed_at: new Date().toISOString(),
        source: 'website_footer',
      });

    if (insertError) {
      console.error('Error inserting newsletter subscriber:', insertError);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'LeaveHub <onboarding@resend.dev>',
        to: [email],
        subject: 'Welcome to the LeaveHub Newsletter! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0f766e; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">LeaveHub</h1>
              <p style="color: #ccfbf1; margin-top: 8px;">🇿🇦 BCEA-Compliant Leave Management</p>
            </div>
            <div style="padding: 40px 32px;">
              <h2 style="color: #111827; margin-top: 0;">Thanks for Subscribing!</h2>
              <p style="color: #374151; line-height: 1.6;">
                You're now subscribed to the LeaveHub newsletter! We'll keep you updated with:
              </p>
              <ul style="color: #374151; line-height: 1.8;">
                <li>🇿🇦 BCEA compliance updates and changes</li>
                <li>💡 Leave management best practices</li>
                <li>📊 New features and product updates</li>
                <li>📚 Resources for South African businesses</li>
              </ul>
              <p style="color: #374151; line-height: 1.6;">
                We respect your inbox and will only send valuable content. You can unsubscribe anytime.
              </p>
              <div style="margin-top: 32px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://leavehub.co.za'}" style="display: inline-block; background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600;">
                  Visit LeaveHub
                </a>
              </div>
            </div>
            <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                © ${new Date().getFullYear()} LeaveHub. Made for South African Businesses.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #0f766e; text-decoration: none;">Unsubscribe</a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Still return success since the subscription was saved
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
    });
  } catch (error: any) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
