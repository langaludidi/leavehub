import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/paystack/utils';

/**
 * Handle Paystack payment callback
 * GET /api/paystack/callback?reference=xxx&trxref=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      return NextResponse.redirect(
        new URL('/pricing?error=no_reference', request.url)
      );
    }

    // Verify transaction with Paystack
    const verification = await verifyTransaction(reference);

    if (!verification.success || verification.data?.status !== 'success') {
      return NextResponse.redirect(
        new URL(`/pricing?error=payment_failed&ref=${reference}`, request.url)
      );
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/dashboard/billing?success=true&ref=${reference}`, request.url)
    );
  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      new URL('/pricing?error=callback_failed', request.url)
    );
  }
}
