import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/roles';
import { sendWelcomeEmail } from '@/lib/email/send';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    console.log('✓ New user created:', id, email_addresses[0]?.email_address);

    // Note: Profile creation is now handled by the onboarding flow
    // This ensures users properly set up their company during first login

    // Send welcome email
    const userEmail = email_addresses[0]?.email_address;
    const userName = first_name || 'there';

    if (userEmail) {
      try {
        await sendWelcomeEmail(userName, userEmail);
        console.log('✓ Welcome email sent to:', userEmail);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the webhook if email fails
      }
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      const supabase = await createClient();

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: email_addresses[0]?.email_address || '',
          first_name: first_name || null,
          last_name: last_name || null,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return new Response('Error updating profile', { status: 500 });
      }

      console.log('✓ Profile updated for user:', id);
    } catch (error) {
      console.error('Error in user.updated webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      const supabase = await createClient();

      // Soft delete or remove profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('clerk_user_id', id);

      if (deleteError) {
        console.error('Error deleting profile:', deleteError);
        return new Response('Error deleting profile', { status: 500 });
      }

      console.log('✓ Profile deleted for user:', id);
    } catch (error) {
      console.error('Error in user.deleted webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('Webhook processed', { status: 200 });
}
