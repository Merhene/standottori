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

const CATEGORIES = new Set(['tattoo', 'partnership', 'invitation', 'informations']);
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_CHARS = 6_000_000; // ~4.5 MB base64

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface IncomingAttachment {
  filename?: string;
  content?: string;
  contentType?: string;
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

  let payload: {
    name?: string;
    email?: string;
    message?: string;
    category?: string;
    budget?: string | null;
    placements?: string[];
    attachments?: IncomingAttachment[];
  };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const name = payload.name?.trim() ?? '';
  const email = payload.email?.trim() ?? '';
  const message = payload.message?.trim() ?? '';
  const category = (payload.category?.trim() ?? 'informations').toLowerCase();
  const budget =
    typeof payload.budget === 'string' && payload.budget.trim()
      ? payload.budget.trim().slice(0, 40)
      : null;
  const placements = Array.isArray(payload.placements)
    ? payload.placements
        .filter((p): p is string => typeof p === 'string')
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 40)
    : [];

  if (!name || !email || !message) {
    return jsonResponse({ error: 'name, email and message are required' }, 400);
  }
  if (!CATEGORIES.has(category)) {
    return jsonResponse({ error: 'Invalid category' }, 400);
  }
  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return jsonResponse({ error: 'Field too long' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Invalid email address' }, 400);
  }

  const rawAttachments = Array.isArray(payload.attachments)
    ? payload.attachments.slice(0, MAX_ATTACHMENTS)
    : [];

  const attachments: { filename: string; content: string; content_type?: string }[] = [];
  for (const item of rawAttachments) {
    const filename = item.filename?.trim() ?? '';
    const content = item.content?.replace(/\s/g, '') ?? '';
    if (!filename || !content) continue;
    if (filename.length > 180 || content.length > MAX_ATTACHMENT_CHARS) {
      return jsonResponse({ error: 'Attachment too large' }, 400);
    }
    if (!/^[A-Za-z0-9+/=]+$/.test(content)) {
      return jsonResponse({ error: 'Invalid attachment encoding' }, 400);
    }
    attachments.push({
      filename,
      content,
      content_type: item.contentType?.slice(0, 120),
    });
  }

  const categoryLabel: Record<string, string> = {
    tattoo: 'Tatouage',
    partnership: 'Partenariat',
    invitation: 'Invitation',
    informations: 'Informations',
  };

  const placementBlock =
    placements.length > 0
      ? `\nEmplacement(s) :\n${placements.map((p) => `  - ${p}`).join('\n')}\n`
      : '';
  const budgetBlock = budget ? `\nBudget : ${budget}\n` : '';

  const resendBody: Record<string, unknown> = {
    from: `Standottori <${FROM_EMAIL}>`,
    to: [CONTACT_TO_EMAIL],
    reply_to: email,
    subject: `[${categoryLabel[category] ?? category}] Message de ${name} via standottori.com`,
    text: `Nom : ${name}\nEmail : ${email}\nObjet : ${categoryLabel[category] ?? category}\n${budgetBlock}${placementBlock}\n${message}`,
  };

  if (attachments.length > 0) {
    resendBody.attachments = attachments;
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resendBody),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    console.error('Resend error:', detail);
    return jsonResponse({ error: 'Failed to send email' }, 502);
  }

  return jsonResponse({ ok: true }, 200);
});
