# chop-API

Backend for the CHOP waitlist. It is a Next.js (App Router) API-only service written in TypeScript with Zod validation and Prisma on PostgreSQL. Email goes out through the [Brevo](https://brevo.com) transactional email API.

All user interface (the waitlist form, the admin dashboard and the unsubscribe page) lives in the frontend repository. The admin dashboard is where the team views and manages waitlist entries.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | none | Health check |
| POST | `/api/waitlist` | none | Register a customer or vendor, then email the team and the registrant |
| POST | `/api/unsubscribe` | signed token | Unsubscribe an email (`{ "token": "..." }` or one-click `?token=`) |
| POST | `/api/admin/session` | email + password | Sign in, returns a bearer token valid for 12 hours |
| GET | `/api/admin/session` | bearer | Check a token |
| GET | `/api/admin/subscribers` | bearer | List every waitlist entry with stats |
| PATCH | `/api/admin/subscribers/:id` | bearer | Update an entry's `status` and/or `adminNotes` |
| DELETE | `/api/admin/subscribers/:id` | bearer | Delete an entry |
| GET | `/api/admin/newsletters` | bearer | Newsletter send history |
| POST | `/api/admin/newsletters` | bearer | Send a newsletter to `all`, `customers`, `vendors` or `selected` ids |
| POST | `/api/admin/newsletters/preview` | bearer | Render a newsletter preview |
| POST | `/api/admin/newsletters/test` | bearer | Send a test newsletter to one address |

All responses are JSON shaped as `{ "success": true, ... }` or `{ "success": false, "code", "message", "details"? }`.

## Project layout

```
prisma/
  schema.prisma          WaitlistEntry, VendorProfile, EmailPreference, Newsletter, AdminUser
  migrations/            SQL migrations
  seed.ts                creates admin accounts
src/
  app/api/...            route handlers only (thin: parse request, call a service, respond)
  config/                env validation (Zod) and the shared option catalog
  generated/prisma/      generated Prisma client (not committed)
  lib/
    db/                  Prisma client and error helpers
    email/               provider interface, Brevo client, templates
    http/                CORS, body parsing, error responses, route wrapper
    security/            HMAC signing, password hashing, unsubscribe tokens, rate limiting
  modules/
    admins/              admin account repository
    auth/                admin login and bearer session tokens
    waitlist/            schema, mapper, repository, notifications, service
    subscribers/         entry mapping, email preferences, stats, admin updates
    newsletter/          schema, audience selection, composer, repository, service
tests/                   Vitest unit tests
```

## Environment

Copy `.env.example` to `.env.local` and fill it in:

- `DATABASE_URL`: PostgreSQL connection string for the CHOP database. CHOP uses Afribase: copy the pooled connection string (port 6543) from the project settings and append `?sslmode=verify-full`. Only this string is needed; the Afribase anon, service_role and JWT keys are not used by this API.
- `APP_SECRET`: at least 32 random characters, for example `openssl rand -base64 48`. Changing it signs everyone out and invalidates existing unsubscribe links.
- `SEED_ADMIN_EMAILS`: comma-separated admin emails that `pnpm db:seed` creates. Entries that are not email addresses are skipped.
- `SEED_ADMIN_PASSWORD`: optional. When set, seeded or reset admins get this password instead of a generated one. Leave it empty in deployed environments.
- `FRONTEND_URL`: where the website is served, used in email links.
- `PUBLIC_API_URL`: where this API is served, used for one-click unsubscribe headers.
- `ADMIN_PATH`: the admin route on the frontend (default `/admin`).
- `ALLOWED_ORIGINS`: comma-separated origins allowed to call the API (defaults to `FRONTEND_URL`).
- `BREVO_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`: email sending. The from address must be a verified sender in Brevo. Without these, signups still save but no email is sent.
- `ADMIN_NOTIFY_EMAIL`: comma-separated inboxes notified for every new signup. Entries that are not email addresses are ignored.

## Local setup

```bash
pnpm install
pnpm db:migrate      # creates the tables in DATABASE_URL
pnpm db:seed         # creates admins from SEED_ADMIN_EMAILS and prints their passwords once
pnpm dev             # http://localhost:4000
```

To give an admin a new password: `pnpm db:seed -- --reset someone@example.com`.

## Scripts

- `pnpm dev`, `pnpm build`, `pnpm start`
- `pnpm db:migrate`, `pnpm db:deploy`, `pnpm db:seed`, `pnpm db:studio`
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm check`

## Deploying on Render

1. Put the Afribase pooled connection string (with `?sslmode=verify-full`) into `DATABASE_URL`. The database is already migrated and seeded; `pnpm db:deploy` in the build step is a no-op until a new migration is added.
2. Create a Web Service from this repository:
   - Build command: `pnpm install --frozen-lockfile && pnpm db:deploy && pnpm build`
   - Start command: `pnpm start` (Next.js reads Render's `PORT`)
3. Add every variable from `.env.example`.
4. To add an admin later, put their email in `SEED_ADMIN_EMAILS` and run `pnpm db:seed` from the service Shell (or locally against the same `DATABASE_URL`). Run `node prisma/seed.ts --reset <email>` to reset a password.
5. Set `VITE_API_URL` on the frontend project to the service URL.

## Notes

- Duplicate signups are blocked by a unique constraint on entry type and normalized WhatsApp number.
- Newsletters are sent five at a time with retries on transient Brevo errors, tagged with the newsletter ID. Recipients without an email or who unsubscribed are skipped, and duplicate emails receive one copy.
- Brevo's free plan allows 300 emails per day; larger sends need a paid plan.
- Rate limits are kept in memory per server instance.
