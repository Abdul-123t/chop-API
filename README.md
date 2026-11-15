# chop-API

Backend for the CHOP waitlist. It is a Next.js (App Router) API-only service written in TypeScript with Zod validation. It stores data in the existing **CHOP — PRE-LAUNCH DATABASE** Google Sheet and sends email through [Resend](https://resend.com).

All user interface (the waitlist form, the admin dashboard and the unsubscribe page) lives in the frontend repository. The frontend talks to this service over HTTPS.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | none | Health check |
| POST | `/api/waitlist` | none | Register a customer or vendor, then email the team and the registrant |
| POST | `/api/unsubscribe` | signed token | Unsubscribe an email (`{ "token": "..." }` or one-click `?token=`) |
| POST | `/api/admin/session` | password | Sign in, returns a bearer token valid for 12 hours |
| GET | `/api/admin/session` | bearer | Check a token |
| GET | `/api/admin/subscribers` | bearer | List everyone on the waitlist with stats |
| GET | `/api/admin/newsletters` | bearer | Newsletter send history |
| POST | `/api/admin/newsletters` | bearer | Send a newsletter to `all`, `customers`, `vendors` or `selected` ids |
| POST | `/api/admin/newsletters/preview` | bearer | Render a newsletter preview |
| POST | `/api/admin/newsletters/test` | bearer | Send a test newsletter to one address |

All responses are JSON shaped as `{ "success": true, ... }` or `{ "success": false, "code", "message", "details"? }`.

## Project layout

```
src/
  app/api/...            route handlers only (thin: parse request, call a service, respond)
  config/                env validation (Zod) and the shared option catalog
  lib/
    email/               provider interface, Resend client, templates
    http/                CORS, body parsing, error responses, route wrapper
    security/            HMAC signing, unsubscribe tokens, rate limiting
    sheets/              Google Sheets client, tab definitions, cell escaping, table helpers
  modules/
    auth/                admin login and bearer session tokens
    waitlist/            schema, sheet row mapper, repository, notifications, service
    subscribers/         subscriber mapping, email preferences, stats, service
    newsletter/          schema, audience selection, composer, log repository, service
tests/                   Vitest unit tests
```

## Google Sheet tabs

The service uses (and creates when missing) four tabs:

- `Customer Waitlist` and `Vendor Applications` are the same columns the frontend's original `/api/waitlist` function writes, so both can run against the same sheet.
- `Email Preferences` is an append-only log of unsubscribe events. The latest row per email wins.
- `Newsletter Log` records each newsletter send.

## Setup

1. Install dependencies: `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill it in:
   - `GOOGLE_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`: the same service account the frontend uses. Share the sheet with its `client_email` as Editor.
   - `APP_SECRET`: at least 32 random characters, for example `openssl rand -base64 48`. Changing it invalidates admin sessions and unsubscribe links.
   - `ADMIN_PASSWORD`: at least 12 characters.
   - `FRONTEND_URL`: where the website is served, used in email links.
   - `PUBLIC_API_URL`: where this API is served, used for one-click unsubscribe headers.
   - `ADMIN_PATH`: the admin route on the frontend (default `/admin`).
   - `ALLOWED_ORIGINS`: comma-separated origins allowed to call the API (defaults to `FRONTEND_URL`).
   - `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`: email sending. Verify the sending domain in Resend first. Without these, signups still save but no email is sent.
   - `ADMIN_NOTIFY_EMAIL`: comma-separated team inbox(es) notified for every new signup.
3. Run `pnpm dev` (port 4000).

## Scripts

- `pnpm dev`, `pnpm build`, `pnpm start`
- `pnpm test` runs unit tests
- `pnpm typecheck` and `pnpm lint`
- `pnpm check` runs all three checks

## Deploying on Vercel

Create a separate Vercel project for this repository, add every variable from `.env.example` to each environment, and point a subdomain such as `api.chopijebu.com` at it. Then set `VITE_API_URL` on the frontend project to that URL.

## Notes

- Rate limits and the duplicate-phone check run per server instance and are best-effort; Google Sheets has no unique constraint.
- Newsletters are sent in batches of 100 with an idempotency key per batch. Recipients without an email or who unsubscribed are skipped automatically, and duplicate emails receive one copy.
