import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface Payload {
  to: string;
  event: "request_submitted" | "request_ready_for_step" | "request_approved" | "request_denied" | "request_auto_approved";
  payload: Record<string, unknown>;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM = Deno.env.get("EMAIL_FROM") || "LeaveHub <no-reply@yourdomain.com>";

async function sendEmail(to: string, subject: string, html: string): Promise<Response> {
  if (!RESEND_API_KEY) {
    console.log("[notify] (dry-run) would send:", { to, subject });
    return new Response(JSON.stringify({ ok: true, dry: true }), { status: 200 });
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from: FROM, to, subject, html })
  });

  if (!resp.ok) {
    const text = await resp.text();
    return new Response(JSON.stringify({ ok: false, error: text }), { status: 500 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

function render(event: string, data: Record<string, unknown>) {
  switch (event) {
    case "request_submitted":
      return {
        subject: "New leave request to review (Step 1)",
        html: `<p>You have a leave request to review.</p>
               <pre>${JSON.stringify(data, null, 2)}</pre>`
      };
    case "request_ready_for_step":
      return {
        subject: `Leave request ready for your step`,
        html: `<p>A leave request advanced to your step.</p>
               <pre>${JSON.stringify(data, null, 2)}</pre>`
      };
    case "request_approved":
      return {
        subject: "Your leave request was approved 🎉",
        html: `<p>Congrats! Your leave request has been approved.</p>
               <pre>${JSON.stringify(data, null, 2)}</pre>`
      };
    case "request_denied":
      return {
        subject: "Your leave request was denied",
        html: `<p>Sorry, your leave request was denied.</p>
               <pre>${JSON.stringify(data, null, 2)}</pre>`
      };
    case "request_auto_approved":
      return {
        subject: "Your leave request was automatically approved",
        html: `<p>No approver chain was configured, so your request was auto-approved.</p>
               <pre>${JSON.stringify(data, null, 2)}</pre>`
      };
    default:
      return {
        subject: `LeaveHub notification: ${event}`,
        html: `<pre>${JSON.stringify(data, null, 2)}</pre>`
      };
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json() as Payload;
    const { subject, html } = render(body.event, body.payload);
    return await sendEmail(body.to, subject, html);
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400 });
  }
});