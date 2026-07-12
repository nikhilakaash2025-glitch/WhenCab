# VIT Carpool

Coordinate cab-pooling to airports and stations before holidays — VIT students only.

## What's here

This is a complete Next.js (App Router) project: Google OAuth locked to
`@vitstudent.ac.in`, ride posting/search with timezone-safe filtering, an
in-app chat system (no phone numbers shown), a report → admin review →
suspend/reinstate moderation flow, an auto-expiration cron, and PWA support
so it installs to the home screen on Android and iOS.

**This code was generated in a sandbox with no internet access**, so
nothing has been installed or run yet. Follow the steps below on your own
machine to actually launch it.

## 1. Install dependencies

```bash
npm install
```

## 2. Set up a database

Get a free Postgres instance from [neon.tech](https://neon.tech) or
[supabase.com](https://supabase.com) — either gives you a connection
string in under a minute.

## 3. Set up Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/) →
create a project → APIs & Services → Credentials → Create OAuth Client ID
(Web application). Add this authorized redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

Copy the Client ID and Secret for the next step.

## 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with:
- `DATABASE_URL` — from step 2
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from step 3
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `ADMIN_EMAILS` — your own `@vitstudent.ac.in` email (comma-separated for multiple admins)
- `CRON_SECRET` — generate with `openssl rand -base64 32`

## 5. Push the schema and seed test data

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

This creates 5 fake students and 5 sample rides so the dashboard isn't
empty on first load.

## 6. Run it

```bash
npm run dev
```

Open **http://localhost:3000** and sign in with a Google account ending in
`@vitstudent.ac.in`. Any other domain is rejected at sign-in.

The first time you log in, you'll be asked for a phone number (Google
doesn't provide one) before you can reach the dashboard.

## Trying the admin panel

Set your own email in `ADMIN_EMAILS`, sign in, then visit
**http://localhost:3000/admin/reports** directly — there's no nav link to
it on purpose, since it's meant for admins only.

## Project structure

```
prisma/schema.prisma       All database models
prisma/seed.ts             Test data
src/lib/auth.ts            NextAuth config + domain restriction
src/lib/rides/             Ride search, create, expiration, matching
src/lib/chat/              Conversations and messages
src/lib/safety/            Report and block logic
src/lib/admin/             Report review, suspend/unsuspend
src/app/api/               All API routes
src/app/dashboard/         Main app screens (search, post ride)
src/app/admin/reports/     Moderation dashboard
src/components/            ChatWidget, RideCard, RideFilters, etc.
```

## Known placeholders to swap before a real launch

- **App icons** (`public/icons/*.png`) are auto-generated placeholders —
  replace with real branded icons (any online PWA icon generator works
  from one source image).
- **Google OAuth app** starts in "Testing" mode with a 100-user cap and an
  "unverified app" warning. Add test users in the Cloud Console, or submit
  for verification before a wider launch.
- **WhatsApp integration**: `src/lib/rides/matchService.ts` has a
  `notifyMatch()` function with the webhook call commented out and ready
  to enable once you have WhatsApp Business API credentials.

## Deploying

```bash
npm install -g vercel
vercel
```

Set the same environment variables in the Vercel dashboard (Project →
Settings → Environment Variables), update `NEXTAUTH_URL` to your deployed
URL, and add the production callback URL to Google Cloud Console:

```
https://your-app.vercel.app/api/auth/callback/google
```

The cron job in `vercel.json` is picked up automatically on deploy.
