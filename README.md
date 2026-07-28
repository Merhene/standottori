# Standottori

Portfolio website for the tattoo artist **Standottori**: pattern-lock artistic entry gate, fullscreen carousel homepage, tattoo/flash galleries, events, biography with a scroll-driven zoom reveal, contact form, and a custom admin panel for the artist.

## Stack

- **Frontend**: React 19 + TypeScript + Vite, Tailwind CSS v4, PrimeIcons, react-router, i18next (FR/EN)
- **Backend**: [Supabase](https://supabase.com) — Postgres (content), Storage (images), Auth (single admin), Edge Function (contact email via [Resend](https://resend.com))
- **Hosting**: Vercel (frontend) + Supabase

## Project structure

```
frontend/            React app
  src/
    components/      Shared UI (layout, admin widgets, GalleryGrid, ZoomReveal…)
    context/         ThemeProvider, AuthProvider
    features/        Lock screen, carousel
    hooks/           useTheme, useAuth
    lib/             Supabase client, content services, types, image utils
    pages/           Public pages + admin pages
supabase/
  migrations/        Database schema (SQL)
  functions/         Edge Functions (contact-email)
images/              Source logo assets
```

## Local development

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Without Supabase credentials the site runs in a degraded mode: static fallback images, placeholder texts, and the admin shows a "backend not configured" notice.

## Events map

`/events` uses **MapLibre GL** + CARTO basemap tiles (no API key). Pins use
`events.latitude` / `events.longitude` (included in `0001_initial_schema.sql`).
Set a place via city search in **Admin → Événements**.

## Supabase setup (one-time)

1. Create a project on [supabase.com](https://supabase.com) (free tier).
2. **Schema**: open *SQL Editor*, paste and run `supabase/migrations/0001_initial_schema.sql`
   (idempotent — safe to re-run; applies upgrades like biography images, `form_url`, event coords).
3. **Admin user**: *Authentication > Users > Add user* — create the artist's account (email + password).
4. **Disable sign-ups**: *Authentication > Sign In / Up > disable "Allow new users to sign up"* (the RLS policies grant write access to any authenticated user, so this must stay off).
5. **Env vars**: copy `frontend/.env.example` to `frontend/.env.local` and fill in the *Project URL* and *anon public key* from *Project Settings > API*. Restart `npm run dev`.
6. **Contact email** (form → artist inbox via Resend):
   - In **Admin → Infos**, set the artist **Email** (this is the delivery address).
   - Create a free [Resend](https://resend.com) account and an API key.
   - From the repo root (needs [Supabase CLI](https://supabase.com/docs/guides/cli) / `npx`):

     ```bash
     npx supabase login
     npx supabase link --project-ref <your-project-ref>
     npx supabase secrets set RESEND_API_KEY=re_xxx
     npx supabase functions deploy contact-email --no-verify-jwt
     ```

   - Optional override (ignores Admin email):  
     `npx supabase secrets set CONTACT_TO_EMAIL=artist@email.com`
   - Optional custom From (after verifying a domain in Resend):  
     `npx supabase secrets set CONTACT_FROM_EMAIL=hello@yourdomain.com`  
     Until then, mail is sent from `onboarding@resend.dev` (Reply-To = visitor).

## Deployment (Vercel)

1. Push the repo to GitHub.
2. On [vercel.com](https://vercel.com): *Add New Project* > import the repo.
3. Set **Root Directory** to `frontend` (framework preset: Vite).
4. Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Deploy. SPA routing is handled by `frontend/vercel.json`.

Every push to the connected branch redeploys automatically. CI (lint + build) runs on GitHub Actions for `main`/`develop`.

## Admin panel

- `/admin` — protected by Supabase Auth (login at `/admin/login`).
- Gallery (tattoo / flash / wallpaper): upload (client-side compressed), delete. Wallpapers feed the homepage carousel.
- Events: create / edit / delete, with upcoming/past display on the public page.
- Biography, site info (contact, socials, hours) and settings (default theme, lock screen toggle, SEO) are editable.

## Notes

- The lock screen pattern is `a → c → f → d → b → e → a` (defined in `frontend/src/features/lockscreen/PatternGrid.tsx`). It is an artistic gate, not a security feature. A discreet accessible "skip" link exists for keyboard/assistive-tech users.
- Supabase free tier pauses projects after ~1 week without traffic; revisit before launch or upgrade.
