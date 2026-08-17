# Pluto Market

A full-stack marketplace for digital products. Sellers list files, buyers pay by
card, and the money is split and paid out automatically — with the delivery of
the actual files gated behind a confirmed payment.

Built with Next.js 15 (App Router), TypeScript, tRPC v11, Prisma + PostgreSQL,
NextAuth, Stripe Connect, UploadThing and Tailwind.

---

## What it does

**For buyers**

- Browse and search a catalogue with category, price and sort filters
- Cart, Stripe Checkout, and a personal library of everything purchased
- Download links that are signed, expiring and tied to your account
- Leave a rating — only on products you actually bought

**For sellers**

- Upload preview images and the deliverable files separately
- Connect a Stripe Express account and get paid automatically after each sale
- Dashboard with earnings, a 30-day revenue chart, and per-sale payout status
- Earnings are held safely (not lost) if Stripe onboarding is not finished yet

**For admins**

- Moderation queue: approve or reject listings with a reason
- Platform stats: gross volume, commission earned, and any stuck payouts

---

## How the money works

This is the part worth reading, because it is where marketplaces usually go
wrong.

1. **Checkout creates a `PENDING` order.** No fulfilment happens here. The
   browser is never trusted to decide whether a payment succeeded.
2. **Stripe calls `/api/webhooks/stripe`.** The signature is verified against
   `STRIPE_WEBHOOK_SECRET`, and every processed event id is recorded so
   at-least-once delivery becomes exactly-once handling.
3. **The order transitions `PENDING → PAID`** via a conditional update, so a
   replayed webhook updates zero rows instead of double-fulfilling.
4. **Each seller is paid by a separate transfer**, keyed on the order item id
   (Stripe idempotency key `payout:<itemId>`). One cart can span many sellers.
   Transfers use the buyer's charge as `source_transaction`, so a payout never
   fails for lack of settled platform balance.
5. **Pluto keeps a flat 5%.** Fee and seller earnings are computed in integer
   cents and always sum back to the listed price — the buyer pays exactly the
   sticker price, and the commission comes out of the seller's share.
6. **A seller without a verified Stripe account still earns.** Their items are
   marked `UNAVAILABLE` rather than failed, and released automatically the
   moment `account.updated` reports payouts are enabled.

All money is stored as integer minor units. There are no floats anywhere in the
payment path.

## How file delivery is protected

Product files are never linked publicly and never appear in any API response.
Downloads go through `/api/download`, which requires **two** independent things
to pass:

- a valid, unexpired HMAC signature on the link (15-minute TTL), and
- a signed-in user who owns a `PAID` order containing that item.

The route then streams the file through the server, so the underlying storage
URL is never exposed to the browser. A leaked link stops working on its own; a
forged one never worked.

Order items snapshot the file list at purchase time, so a seller editing or
delisting a product cannot retroactively change what an existing buyer paid for.

---

## Running it locally

**Requirements:** Node 20+, Docker (for Postgres), a Stripe test account.

```bash
git clone https://github.com/GeroWalther/pluto.git
cd pluto
npm install

cp .env.example .env      # then fill it in — see below

docker compose up -d      # starts Postgres on :5432
npm run db:push           # creates the schema
npm run db:seed           # demo catalogue + accounts

npm run dev
```

Open http://localhost:3000.

### Seeded accounts

All seeded accounts use the password `password123`.

| Account            | Role   |
| ------------------ | ------ |
| `admin@pluto.test` | Admin  |
| `buyer@pluto.test` | Buyer  |
| `mara@pluto.test`  | Seller |
| `tobias@pluto.test`| Seller |
| `priya@pluto.test` | Seller |
| `jonas@pluto.test` | Seller |

### Environment variables

Every variable is documented in [`.env.example`](.env.example). The required
ones:

| Variable                | Where to get it                                     |
| ----------------------- | --------------------------------------------------- |
| `DATABASE_URL`          | `docker compose up -d` gives you the default value   |
| `NEXTAUTH_SECRET`       | `openssl rand -base64 32`                            |
| `DOWNLOAD_TOKEN_SECRET` | `openssl rand -base64 32`                            |
| `STRIPE_SECRET_KEY`     | Stripe dashboard → Developers → API keys (test mode) |
| `STRIPE_WEBHOOK_SECRET` | printed by `npm run stripe:listen`                   |
| `UPLOADTHING_TOKEN`     | uploadthing.com dashboard                            |

Google/GitHub OAuth and Resend email are optional. Leave them blank and the app
degrades gracefully: the social buttons are hidden, and emails are logged to the
console instead of sent.

### Testing the full purchase flow

Stripe needs to reach your machine, so run the CLI listener in a second
terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the whsec_… it prints into STRIPE_WEBHOOK_SECRET, then restart `npm run dev`
```

Then buy something with test card `4242 4242 4242 4242`, any future expiry, any
CVC. The thank-you page polls until the webhook lands, then unlocks the
downloads.

For seller payouts, connect a Stripe account from **Dashboard → Payouts**. In
test mode you can use Stripe's prefilled test values and `000000` as the SMS
code.

---

## Project layout

```
prisma/schema.prisma      Data model — users, products, orders, order items, reviews
prisma/seed.ts            Demo catalogue

src/app/                  Routes (App Router)
  api/webhooks/stripe/    Signature-verified webhook — the only thing that marks an order paid
  api/download/           Signed, ownership-checked file delivery
  api/trpc/[trpc]/        tRPC handler
  api/uploadthing/        Upload endpoints (auth-gated)

src/trpc/routers/         API surface: product, seller, order, review, payouts, admin, account
src/server/services/      Business logic: checkout, fulfilment, Stripe Connect, emails
src/lib/                  Env validation, Stripe client, download tokens, validators
src/components/           UI — shadcn primitives in ui/, feature components alongside
```

The routers stay thin; anything with real logic lives in `src/server/services`.

## Scripts

| Command              | What it does                              |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Development server                        |
| `npm run build`      | Production build                          |
| `npm run typecheck`  | `tsc --noEmit`                            |
| `npm run db:push`    | Sync the schema to the database           |
| `npm run db:studio`  | Prisma Studio                             |
| `npm run db:seed`    | Reseed the demo catalogue                 |
| `npm run verify`     | Integration check of the fulfilment path  |
| `npm run stripe:listen` | Forward Stripe webhooks to localhost   |

`npm run verify` runs against the real database and asserts the things that are
easy to get wrong: that fees and earnings always sum back to the charged amount,
that download tokens reject tampering and expiry, that a two-seller order
fulfils correctly, and — most importantly — that replaying the same webhook
does not double-increment sales or re-send receipts. It cleans up after itself.

---

## Deploying

Works on Vercel with any hosted Postgres (Neon and Supabase both fit the free
tier).

1. Push the repo and import it into Vercel.
2. Set every variable from `.env.example` in the project settings, with
   `NEXT_PUBLIC_SERVER_URL` and `NEXTAUTH_URL` pointing at the deployed origin.
3. Run `npx prisma db push` against the production database once.
4. In Stripe, add a webhook endpoint at `https://your-domain/api/webhooks/stripe`
   subscribed to `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired` and
   `account.updated`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.

Keep it in Stripe test mode unless you intend to handle real money — going live
means real payouts, tax obligations and a Stripe platform agreement.

---

Built by [Gero Walther](https://github.com/GeroWalther).
