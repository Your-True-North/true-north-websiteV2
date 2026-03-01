# CLAUDE.md — True North Website V2

> AI assistant context for this repository. Keep this file up to date when making significant architectural changes.

---

## Project Overview

True North is a **transformation coaching platform** built for Circle of Return (CoR) — a men's inner-work program led by Mason. The site combines a public marketing presence with a password-protected members portal offering video content, community forums, live calls, and progress tracking.

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript + JavaScript (mixed; TypeScript strict mode is **off**)
- **Database:** PostgreSQL accessed via raw `pg` pool queries (no ORM at runtime; Prisma is schema-only)
- **Auth:** Custom JWT stored in `auth_token` cookie (30-day expiry)
- **Hosting:** Vercel (primary), Firebase Hosting (secondary)
- **Node Version:** 20 (see `.nvmrc`)

---

## Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

> **Note:** `next.config.js` sets `ignoreDuringBuilds: true` for both ESLint and TypeScript errors. The build will succeed even with type errors. Do not rely on the build step to catch type mistakes — run `tsc --noEmit` explicitly if you need type checking.

---

## Repository Structure

```
/
├── app/                        # Next.js App Router (primary source)
│   ├── (marketing)/            # Public pages with nav + footer
│   ├── (auth)/                 # Login/register/reset (no nav)
│   ├── (protected)/            # JWT-gated member pages (MembersNav)
│   ├── admin/                  # Admin-only pages
│   ├── api/                    # ~43 API route handlers
│   ├── components/             # App-level React components
│   └── globals.css             # Global styles (24 KB, includes Tailwind directives)
├── components/                 # Root-level legacy components (mostly unused)
├── lib/                        # Shared server utilities
│   ├── auth.js                 # JWT helpers + rate limiter
│   ├── db.js                   # PostgreSQL pool + query helper
│   ├── validation.js           # Input validators + sanitizer
│   ├── firebaseAdmin.ts        # Firebase Admin SDK init
│   └── mason-knowledge-base.ts # Placeholder for Ask True North AI feature
├── prisma/
│   └── schema.prisma           # DB schema reference (not used at runtime)
├── public/                     # Static assets, PDFs, fonts, images
├── functions/                  # Firebase Cloud Functions
├── dataconnect/                # Google DataConnect config (not primary DB)
├── migrations/                 # Raw SQL migration files
├── middleware.ts               # Auth guard for /members, /journey, /community
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Route Groups & Auth Model

The App Router uses **route groups** (parenthesised folders) that share layouts:

| Group | Path prefix | Layout includes | Auth required |
|---|---|---|---|
| `(marketing)` | `/`, `/about`, `/work`, `/circle`, etc. | Navigation, MysticalBackground, Footer | No |
| `(auth)` | `/auth/login`, `/auth/register`, `/auth/reset-password` | MysticalBackground only | No |
| `(protected)` | `/journey`, `/community`, `/members`, `/forum`, `/calls`, etc. | MembersNav, Footer | Yes (JWT cookie) |
| `admin` | `/admin/*` | Own layout | Admin role |

**Middleware** (`middleware.ts`) checks for the `auth_token` cookie on `/members/*`, `/journey/*`, and `/community/*` — redirecting to `/auth/login` if absent. The middleware is **not** exhaustive; the `(protected)` group routes under `/forum/*`, `/calls/*`, `/replays/*`, etc. also need protection but are not currently in the middleware matcher. When adding new protected routes, update the `matcher` in `middleware.ts`.

---

## Database Layer

All database access goes through `lib/db.js`:

```js
import { query, getClient } from '@/lib/db'

// Simple query
const result = await query('SELECT * FROM users WHERE id = $1', [userId])

// Transaction (use getClient)
const client = await getClient()
try {
  await client.query('BEGIN')
  // ...
  await client.query('COMMIT')
} catch (e) {
  await client.query('ROLLBACK')
  throw e
} finally {
  client.release()
}
```

**Key facts:**
- Uses raw parameterised SQL — **always** use `$1, $2, …` placeholders, never string interpolation
- Pool size: 20 connections, 30 s idle timeout, 5 s connection timeout
- Env vars checked in order: `DATABASE_PUBLIC_URL` → `DATABASE_URL` → hardcoded fallback (Railway)
- Slow queries (> 1 s) are logged to console in dev
- **Prisma** (`prisma/schema.prisma`) documents the schema but is NOT used for runtime queries — migrations are raw SQL in `migrations/`

### Key Database Tables

| Table | Purpose |
|---|---|
| `users` | Members and admins |
| `videos` | Video library entries |
| `comments` | Video comments (supports nesting via `parent_id`) |
| `reactions` | Emoji reactions on videos |
| `activity` | Activity log / audit trail |
| `community_posts` | Forum posts (**canonical name**) |
| `post_replies` | Forum replies (**canonical name**) |

> **Known issue:** Some API routes mistakenly reference `forum_posts` / `forum_replies` instead of `community_posts` / `post_replies`. Always use the canonical names above when writing new queries.

---

## Authentication

**`lib/auth.js` exports:**

| Function | Purpose |
|---|---|
| `createToken(payload)` | Sign a JWT (30-day expiry) |
| `verifyToken(token)` | Validate JWT, returns payload or null |
| `getAuthUser(request)` | Extract user from `Authorization: Bearer …` header or `auth_token` cookie |
| `requireAuth(request, options)` | Returns `{ user }` or `{ error: NextResponse }` |
| `rateLimit(id, max, windowMs)` | In-memory rate limiter (per identifier) |

**Pattern for protected API routes:**

```js
import { requireAuth } from '@/lib/auth'

export async function GET(request) {
  const { user, error } = requireAuth(request)
  if (error) return error

  // user.id, user.email, user.role available
}
```

**Admin-only routes** pass `{ requiredRole: 'admin' }`:

```js
const { user, error } = requireAuth(request, { requiredRole: 'admin' })
```

**Secret:** JWT is signed with `process.env.NEXTAUTH_SECRET`. This env var is **required** in production.

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and populate all required values.

| Variable | Required | Purpose |
|---|---|---|
| `NEXTAUTH_SECRET` | **Yes** | JWT signing secret |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `DATABASE_PUBLIC_URL` | No | Alternative PG connection (takes priority) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes (if Firebase used) | Firebase Admin credentials (JSON string) |
| `STRIPE_SECRET_KEY` | Yes (payments) | Stripe server key |
| `STRIPE_WEBHOOK_SECRET` | Yes (payments) | Stripe webhook signature |
| `SENDGRID_API_KEY` | Yes (email) | SendGrid email |
| `RESEND_API_KEY` | No | Resend email alternative |
| `OPENAI_API_KEY` | No | Ask True North AI feature |
| `GOOGLE_CALENDAR_*` | No | Google Calendar integration |
| `ZOOM_*` | No | Zoom meetings integration |

---

## Input Validation

Always use `lib/validation.js` for user-supplied data. Never trust raw request input.

```js
import { validateEmail, validatePassword, validateName, sanitizeInput } from '@/lib/validation'

const emailResult = validateEmail(email)   // { valid: boolean, error?: string }
const sanitized   = sanitizeInput(input)   // trims + caps length (5000 chars default)
```

Validators: `validateEmail`, `validatePassword` (8–128 chars), `validateName` (1–100), `validateComment` (1–5000), `validateVideoId` (numeric), `validateYoutubeUrl`.

---

## Styling Conventions

- **Tailwind CSS 4** — utility-first, configured in `tailwind.config.js`
- Content paths: `app/**/*.{js,ts,jsx,tsx,mdx}` and `components/**/*.{js,ts,jsx,tsx,mdx}`
- Custom fonts defined in Tailwind config: `font-inter` (sans-serif), `font-crimson` (serif)
- Headings use **Gambarino** (serif, loaded via `@font-face` in `app/globals.css`)
- Additional custom fonts: Greater Neue (`.otf` files in `app/`)
- Custom utilities: `backdrop-blur-xs` (2 px blur)
- **Do not** add inline `style` attributes for things achievable with Tailwind classes
- Global CSS lives in `app/globals.css` — keep component-specific overrides in the component file using Tailwind; avoid adding new global rules unless truly global

---

## Component Conventions

- Components that belong to a single route live co-located inside `app/(group)/route/`
- Shared components used across multiple routes belong in `app/components/`
- The root-level `components/` directory is **legacy** — prefer `app/components/` for new work
- Animated backgrounds / decorative elements: `MysticalBackground.tsx`
- Navigation:
  - Public site: `app/components/Navigation.tsx`
  - Member portal: `app/components/MembersNav.tsx` (hides public nav)
- Framer Motion is available for animations (`framer-motion`)
- Lucide React for icons (`lucide-react`)

---

## API Route Conventions

All API routes live under `app/api/`. Use the Next.js App Router convention:

```
app/api/resource/route.ts          # GET, POST handlers
app/api/resource/[id]/route.ts     # Dynamic segment
```

Standard response pattern:

```js
// Success
return NextResponse.json({ data }, { status: 200 })

// Error
return NextResponse.json({ error: 'Message' }, { status: 400 })
```

Always:
1. Call `requireAuth()` at the top of protected routes
2. Validate and sanitize all inputs before touching the database
3. Use parameterised queries (`$1, $2, …`)
4. Wrap multi-step operations in a DB transaction

---

## Key Features & Their Locations

| Feature | UI | API |
|---|---|---|
| Video library + progress | `app/(protected)/journey/` | `app/api/videos/` |
| Video comments + reactions | `app/(protected)/videos/[videoId]/` | `app/api/videos/[id]/comments/`, `app/api/videos/[id]/reactions/` |
| Community forum | `app/(protected)/community/` | `app/api/forum/posts/` |
| Member directory | `app/(protected)/members/` | `app/api/user/` |
| Admin dashboard | `app/admin/dashboard/` | `app/api/admin/` |
| Soul Mirror Quiz | `app/components/SoulMirrorQuiz.tsx` | (client-side) |
| Ask True North (AI chat) | `app/components/AskDi.tsx` / `AskTrue.tsx` | `app/api/ask-di/` |
| Circle of Return checkout | `app/components/CorCheckout.tsx` | `app/api/stripe/` |
| Email (Resend / SendGrid) | — | `app/api/test-resend/`, `lib/sendgrid.js` |
| Google Calendar events | `app/components/calendar/` | `app/api/calendar/` |
| ConvertKit integration | — | `app/api/convertkit/` |

---

## Known Issues & Technical Debt

These are documented issues — **do not work around them silently**; fix them properly:

1. **Forum table naming inconsistency** — Some routes use `forum_posts`/`forum_replies` (wrong). Canonical names are `community_posts` and `post_replies`. Fix any new query to use canonical names and migrate legacy routes.

2. **Middleware coverage gap** — The middleware matcher only covers `/members/*`, `/journey/*`, `/community/*`. Routes under `/forum/*`, `/calls/*`, `/replays/*`, `/about-cor/*` are not protected at the middleware level (they rely on API-level auth only). Consider expanding the matcher.

3. **In-memory rate limiting** — `lib/auth.js` implements rate limiting with a `Map`. This does not persist across serverless function instances. For production scale, replace with Redis (Upstash or similar).

4. **Ask True North feature** — The AI Q&A feature (`app/api/ask-di/`) is not fully wired. `lib/mason-knowledge-base.ts` contains placeholder content. The feature is hidden on the library page until complete.

5. **TypeScript strict mode off** — `tsconfig.json` has `strict: false`. Type errors are also silenced at build time. Be careful with null checks and type assumptions.

6. **Mixed JS/TS** — Some files use `.js` (including `lib/auth.js`, `lib/db.js`). New files should use `.ts`/`.tsx`. Do not convert existing files unless the entire module is being reworked.

7. **Hardcoded DB fallback** — `lib/db.js` contains a hardcoded fallback connection string. Ensure `DATABASE_URL` is always set in production to avoid falling back to this.

---

## Security Guidelines

- **Never** interpolate user input into SQL strings — use parameterised queries only
- **Never** expose password hashes, JWT secrets, or internal IDs in API responses
- **Never** add debug/test endpoints that expose sensitive data (historical issue — two such routes were deleted)
- Validate role (`user.role === 'admin'`) before any admin operation
- Sanitize all user-generated content before storing or rendering
- Set `HttpOnly` and `Secure` flags when writing `auth_token` cookies in production

---

## Deployment

**Vercel (primary):**
- Push to `main` triggers auto-deploy
- Set all required environment variables in the Vercel dashboard
- Build command: `next build`
- Output: `.next/`

**Firebase Hosting (secondary):**
- `firebase.json` and `.firebaserc` are configured for project `true-north-6ac7f`
- Deploy with: `firebase deploy`
- Cloud Functions in `functions/src/index.ts`

---

## Documentation Files

Several audit and diagnostic documents exist at the repository root. These are historical and may be outdated:

| File | Content |
|---|---|
| `TECHNICAL_AUDIT_REPORT.md` | Comprehensive code quality audit |
| `CRITICAL_FIXES_SUMMARY.md` | Summary of security/bug fixes applied |
| `INFRASTRUCTURE_AUDIT_REPORT.md` | Infrastructure & security analysis |
| `DATABASE_AUDIT_RESULTS.md` | DB schema verification results |
| `COMMUNITY-AUDIT.md` | Community feature audit |
| `CLAUDE_CODE_CONTINUATION_BRIEF.md` | Previous AI session context |

Do **not** create additional audit/diagnostic markdown files. Update this `CLAUDE.md` instead.

---

## Working on This Codebase — Checklist

Before submitting any change:

- [ ] Parameterised SQL — no string interpolation
- [ ] New protected API routes call `requireAuth()`
- [ ] New protected pages/routes added to `middleware.ts` matcher if needed
- [ ] User input validated via `lib/validation.js`
- [ ] Using `community_posts` / `post_replies` table names (not `forum_posts`)
- [ ] No sensitive data logged or returned in API responses
- [ ] Tailwind utility classes used instead of inline styles where possible
- [ ] New shared components placed in `app/components/`, not root `components/`
