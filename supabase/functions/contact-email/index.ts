// Supabase Edge Function: forwards contact-form messages to the artist by email.
//
// Deploy:   supabase functions deploy contact-email --no-verify-jwt
// Secrets:  supabase secrets set RESEND_API_KEY=re_xxx CONTACT_TO_EMAIL=artist@example.com
//
// Uses Resend (https://resend.com) - free tier: 100 emails/day.
// Until a custom domain is verified in Resend, the "from" address must be
// onboarding@resend.dev.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const CONTACT_TO_EMAIL = Deno.env.get('CONTACT_TO_EMAIL');
const FROM_EMAIL = Deno.env.get('CONTACT_FROM_EMAIL') ?? 'onboarding@resend.dev';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    return jsonResponse({ error: 'Email service not configured' }, 500);
  }

  let payload: { name?: string; email?: string; message?: string };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const name = payload.name?.trim() ?? '';
  const email = payload.email?.trim() ?? '';
  const message = payload.message?.trim() ?? '';

  if (!name || !email || !message) {
    return jsonResponse({ error: 'name, email and message are required' }, 400);
  }
  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return jsonResponse({ error: 'Field too long' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Invalid email address' }, 400);
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Standottori <${FROM_EMAIL}>`,
      to: [CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `Nouveau message de ${name} via standottori.com`,
      text: `Nom : ${name}\nEmail : ${email}\n\n${message}`,
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    console.error('Resend error:', detail);
    return jsonResponse({ error: 'Failed to send email' }, 502);
  }

  return jsonResponse({ ok: true }, 200);
});
