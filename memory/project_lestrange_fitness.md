---
name: L'Estrange Fitness App
description: Full-stack PT client portal built with Next.js 14, Supabase, Stripe, Resend
type: project
---

Full production build complete and compiling clean.

**Why:** User wanted a full PT client portal for L'Estrange Fitness brand.

**How to apply:** When making changes, refer to the established patterns — server components fetch data, client components handle interactivity.

## Stack
- Next.js 14 App Router (no src/ directory)
- Supabase (auth + db + storage) — project: jbxqwewtelhkmkjkanzn
- Stripe live keys — price IDs in `lib/stripe-products.ts`
- Resend for email (needs API key in .env.local)
- Tailwind v4 with @tailwindcss/postcss
- Recharts for progress charts
- @react-pdf/renderer for invoice PDFs
- Sonner for toasts

## Route Groups
- `(auth)` — /login, /signup
- `(pt)` — /dashboard, /clients, /clients/[id], /sessions, /bookings, /payments, /settings
- `(client)` — /portal/dashboard, /portal/progress, /portal/sessions, /portal/bookings, /portal/payments

## Stripe Products (live)
- 1:1 Session: price_1TUPk11E30KPiu7XBdToSwxk
- Class Pass: price_1TUPlA1E30KPiu7XxfkxLC4r
- Monthly Class Pass Unlimited: price_1TUPly1E30KPiu7XaEHoVIQQ
- 5 PT Package: price_1TUPnv1E30KPiu7XAP0rqulA
- 10 PT Package: price_1TUPpe1E30KPiu7XMuY1cTuk

## Outstanding env vars (user needs to fill in)
- RESEND_API_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_APP_URL (for production)
