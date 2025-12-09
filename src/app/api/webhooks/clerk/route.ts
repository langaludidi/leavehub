import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/roles';

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

    try {
      const supabase = createServerClient();

      // Get the demo company ID (for now, all users join the demo company)
      // In production, you'd implement proper organization selection
      const demoCompanyId = '12345678-1234-1234-1234-123456789000';

      // Create profile with default employee role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          clerk_user_id: id,
          email: email_addresses[0]?.email_address || '',
          first_name: first_name || null,
          last_name: last_name || null,
          role: UserRole.EMPLOYEE, // Default to employee role
          company_id: demoCompanyId,
          department: null, // Can be set later by HR/Admin
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return new Response('Error creating profile', { status: 500 });
      }

      console.log('✓ Profile created for user:', id);
    } catch (error) {
      console.error('Error in user.created webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      const supabase = createServerClient();

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
      const supabase = createServerClient();

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
