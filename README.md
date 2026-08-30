# WhenCab

WhenCab helps VIT students coordinate shared cabs to airports and stations. It is available only to students signing in with a `@vitstudent.ac.in` Google account.

## Features

- Google sign-in restricted to exact `@vitstudent.ac.in` addresses
- Username-only onboarding, with the account's Google profile photo used automatically
- Ride creation, filtering, history, and automatic expiry
- Private in-app conversations between ride participants
- Unread-message badge and a 20-second new-message notification
- Profile menu with username editing, theme switcher, history, and sign-out
- High-contrast dark and light themes
- In-app reporting, blocking, and administrator moderation tools
- About Us menu with creator profiles and LinkedIn links
- Installable Progressive Web App (PWA)

## Tech stack

- Next.js 14 (App Router) and TypeScript
- Auth.js / NextAuth with Google OAuth
- Prisma and PostgreSQL
- Tailwind CSS
- Vercel deployment and cron jobs

## Run locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` with the following values:

```env
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
AUTH_SECRET="..."
ADMIN_EMAILS="your-name@vitstudent.ac.in"
CRON_SECRET="..."
```

`NEXTAUTH_SECRET` is also supported as an alternative to `AUTH_SECRET`.

### 3. Configure Google OAuth

Create a Google OAuth web client and add this redirect URI for local development:

```text
http://localhost:3000/api/auth/callback/google
```

### 4. Apply database migrations and start the app

```bash
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deploy to Vercel with:

```bash
vercel --prod
```

Add the same environment variables to the Vercel project, then add the production callback URI to Google Cloud:

```text
https://your-domain.vercel.app/api/auth/callback/google
```

Apply migrations to the production database before or alongside deployment:

```bash
npx prisma migrate deploy
```

## Project structure

```text
prisma/                 Database schema and migrations
src/app/                Pages and API routes
src/components/         Shared interface components
src/lib/                Authentication, chat, ride, safety, and admin services
src/context/            Client-side chat state
public/                 PWA icons and manifest assets
```

## About

Created by [Nikhilakaash.C](https://www.linkedin.com/in/nikhilakaashc) and [Krishil Modi](https://www.linkedin.com/in/krishilmodi).
