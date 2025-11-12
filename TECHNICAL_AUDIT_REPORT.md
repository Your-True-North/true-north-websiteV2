# True North Website - Comprehensive Technical Audit Report

**Date:** November 1, 2025
**Auditor:** Claude Code
**Purpose:** Compare documented specifications against actual codebase implementation
**Session:** claude/fix-critical-issues-011CUdCmshaoGDPRVKqrck2b

---

## EXECUTIVE SUMMARY

This audit reveals a **production system with solid core functionality** but **critical inconsistencies** in database schema usage, incomplete feature implementations, and technical debt that poses **immediate risk to system stability**.

**Risk Level:** 🔴 **HIGH** - Critical database inconsistencies could cause production failures
**Overall Implementation Score:** 6.5/10
**Stability Score:** 5/10 (inconsistent table references)
**Feature Completeness:** 7/10 (most features exist but some incomplete)

### Critical Issues Requiring Immediate Attention

1. **CRITICAL:** Forum API uses inconsistent table names across routes (potential production breakage)
2. **CRITICAL:** "Ask True" AI feature has placeholder knowledge base (non-functional)
3. **HIGH:** Duplicate Stripe webhook handlers (confusion and potential bugs)
4. **HIGH:** Database migrations don't match actual production table names
5. **MEDIUM:** Deprecated/unused components in codebase

---

## 1. DATABASE SCHEMA AUDIT

### 🔴 CRITICAL: Table Naming Inconsistency

**Finding:** The forum/community feature has **conflicting table references** across different API routes.

**Schema Definition (migrations/002_members_portal_schema.sql):**
```sql
CREATE TABLE community_posts (...)
CREATE TABLE post_replies (...)
CREATE TABLE post_reactions (...)
```

**Schema Definition (migrations/004_admin_and_likes.sql):**
```sql
CREATE TABLE post_likes (...)  -- references community_posts
CREATE TABLE reply_likes (...) -- references post_replies
```

**API Implementation Reality:**

| Route | Tables Used | Status |
|-------|-------------|--------|
| `app/api/forum/posts/route.js` (main list) | `forum_posts`, `forum_replies`, `forum_likes` | ❌ Doesn't match schema |
| `app/api/forum/posts/[id]/route.js` (detail) | `community_posts`, `post_replies` | ✅ Matches schema |
| `app/api/forum/posts/[id]/like/route.js` | `post_likes` | ✅ Matches schema |
| `app/api/forum/posts/[id]/reply/route.js` | `post_replies` | ✅ Matches schema |

**Analysis:**

The main posts route (`/api/forum/posts`) was changed in commit `887fa0b` to use `forum_posts`, `forum_replies`, and `forum_likes` tables, but:

1. **Migrations never created these tables** - schema only defines `community_posts`
2. **Other forum routes still use original names** - creating inconsistency
3. **Either:**
   - Production database was manually altered (tables renamed) and migrations not updated ❌
   - OR the commit `887fa0b` introduced a breaking bug ❌

**Impact:**
- If production DB has `community_posts`: Main forum list route is broken 🔴
- If production DB has `forum_posts`: Post detail, likes, and replies routes are broken 🔴
- Migration files don't reflect production reality
- Cannot recreate production schema from migrations alone

**Recommendation:**
```sql
-- URGENT: Verify actual production table names with:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%post%';

-- Then either:
-- Option A: Revert commit 887fa0b (use community_posts everywhere)
-- Option B: Create migration to rename tables and update all routes
```

### Database Tables Status

| Table | Migration | Used By | Status |
|-------|-----------|---------|--------|
| `users` | ✅ Multiple | Auth, all features | ✅ Core table |
| `videos` | ✅ 001, 002 | Video library | ✅ Working |
| `comments` | ✅ 001 | Video comments | ✅ Working |
| `reactions` | ✅ 001 | Video reactions | ✅ Working |
| `user_video_progress` | ✅ 002 | Progress tracking | ✅ Working |
| `video_comments` | ✅ 002 | Video comments (duplicate?) | ⚠️ Duplicate of `comments`? |
| `video_reactions` | ✅ 002 | Video reactions (duplicate?) | ⚠️ Duplicate of `reactions`? |
| `community_posts` | ✅ 002 | Forum (partially) | ❌ Inconsistent usage |
| `forum_posts` | ❌ None | Forum main route | ❌ Not in migrations |
| `post_replies` | ✅ 002 | Forum replies | ✅ Working |
| `forum_replies` | ❌ None | Forum main route (JOIN) | ❌ Not in migrations |
| `post_likes` | ✅ 004 | Forum likes | ✅ Working |
| `forum_likes` | ❌ None | Forum main route (JOIN) | ❌ Not in migrations |
| `founding_members` | ✅ 003 | Founding member tracking | ✅ Working |
| `founding_waitlist` | ✅ 003 | Waitlist when full | ✅ Working |
| `live_calls` | ✅ 002 | Call scheduling | ✅ Working |
| `notifications` | ✅ 002 | User notifications | ⚠️ Table exists, no API |
| `practice_entries` | ✅ 002 | Practice tracking | ⚠️ Table exists, no API |

**Findings:**
- ✅ 15 tables properly defined in migrations
- ❌ 3 tables used by code but NOT in migrations (`forum_posts`, `forum_replies`, `forum_likes`)
- ⚠️ 4 tables defined but not used by any API (`notifications`, `practice_entries`, `video_comments`?, `video_reactions`?)
- ❓ Possible duplicate tables for video comments/reactions (001 vs 002 migrations)

---

## 2. "ASK TRUE" AI INTEGRATION AUDIT

### 🔴 CRITICAL: Non-Functional AI Feature

**Documentation Status:** ✅ Complete setup guide exists (`ASK_TRUE_NORTH_SETUP.md`)

**Implementation Status:**

| Component | File | Status |
|-----------|------|--------|
| API Route | `app/api/ask-di/route.ts` | ✅ Fully implemented with OpenAI |
| Knowledge Base | `lib/mason-knowledge-base.ts` | ❌ **ALL PLACEHOLDER TEXT** |
| Frontend (Library) | `app/(marketing)/library/page.tsx` | ✅ Calls API correctly |
| Frontend Component | `components/AskTrue.tsx` | ⚠️ Mock/deprecated version |
| Environment Config | `.env.local` | ❌ File doesn't exist |
| API Key | `OPENAI_API_KEY` | ❌ Not configured |

**Code Analysis:**

`lib/mason-knowledge-base.ts` (lines 10-76):
```typescript
export const masonKnowledgeBase = `
# About Mason (True North)

## Core Philosophy
[Add your core beliefs and philosophy here]
- What you believe about transformation
- Your approach to personal growth
- Key principles you teach

## Your Background & Expertise
[Add information about your background]
...
```

**Current Behavior:**
- API route checks for `OPENAI_API_KEY`
- If missing, returns fallback: *"The path you seek is already within you..."*
- Knowledge base contains zero actual content - just placeholders
- Even with API key, responses would be generic (no Mason-specific knowledge)

**Components:**

1. **`components/AskTrue.tsx`** - Standalone component (NOT used anywhere)
   - Uses `setTimeout` mock (line 16)
   - Returns hardcoded response (line 17)
   - Appears to be deprecated/replaced

2. **Library page integration** - Actual implementation
   - Lines 39-43: Calls `/api/ask-di` endpoint correctly
   - Lines 32-36: Has 3-question limit
   - Fallback handling on errors

**Impact:**
- Feature appears in library page but is non-functional
- Users receive generic fallback responses
- AI has no knowledge of Mason's actual teachings
- OpenAI API not configured (would fail anyway)

**Recommendation:**
```typescript
// IMMEDIATE ACTION REQUIRED:
// 1. Populate lib/mason-knowledge-base.ts with actual content
// 2. Add OPENAI_API_KEY to production environment
// 3. Remove/archive components/AskTrue.tsx (unused)
// 4. Test with real questions to verify quality
```

**Estimated Setup Time:** 2-4 hours to populate knowledge base with real content

---

## 3. STRIPE INTEGRATION AUDIT

### ⚠️ HIGH: Duplicate Webhook Handlers

**Finding:** Two separate Stripe webhook handlers exist in codebase

| Handler | Path | Status | Functionality |
|---------|------|--------|---------------|
| Handler A | `app/api/stripe/webhooks/route.js` | ✅ Production-ready | 387 lines, complete |
| Handler B | `app/api/webhooks/stripe/route.ts` | ❌ Mock/stub | 79 lines, placeholder |

**Handler A Analysis** (`app/api/stripe/webhooks/route.js`):

✅ **Complete Production Implementation:**
- Signature verification (lines 11-45)
- Secure password generation (lines 48-58)
- Welcome email with credentials (lines 61-152)
- User creation in database (lines 246-266)
- Founding members tracking (lines 271-279)
- ConvertKit tagging (lines 291-315)
- Subscription update/cancel handling (lines 338-371)
- Error handling and logging

**Events Handled:**
- `checkout.session.completed` ✅
- `customer.subscription.updated` ✅
- `customer.subscription.deleted` ✅

**Handler B Analysis** (`app/api/webhooks/stripe/route.ts`):

❌ **Stub Implementation:**
```typescript
const userService = {
  async createUser(userData) {
    const user = { id: Date.now(), ...userData, createdAt: new Date() };
    console.log("Created user:", user);
    return user;  // Just logs, doesn't save to DB
  },
  async findUserByEmail(email) { return null; }
};
```

**Events Handled:**
- `customer.subscription.created` (incomplete)

**Which Handler is Active?**

Stripe webhooks are configured with a single URL endpoint. Based on typical Next.js routing:
- `/api/stripe/webhooks` ← Handler A (more specific route)
- `/api/webhooks/stripe` ← Handler B (less specific)

**Recommendation:**
```bash
# IMMEDIATE ACTION:
# 1. Verify which endpoint Stripe is actually configured to use
# 2. Delete the unused handler (likely Handler B)
# 3. Update Stripe dashboard webhook URL if needed

# Check Stripe webhook configuration:
# Dashboard > Developers > Webhooks > Your endpoint URL
```

### Stripe Integration Completeness

**Frontend Integration:**

| Location | Product | Price | Link Type | Status |
|----------|---------|-------|-----------|--------|
| `/founding` page | Founding Membership | £25/month | Payment Link | ✅ Working |
| `/work` page | Breathwork Journey | £200 one-time | Payment Link | ✅ Working |
| `/work` page | Energy Healing | £120 one-time | Payment Link | ✅ Working |
| `/circle` page | Redirects to founding | - | Redirect | ✅ Working |

**Environment Variables Required:**
```bash
STRIPE_SECRET_KEY=sk_live_...      # ✅ Used in webhook
STRIPE_WEBHOOK_SECRET=whsec_...    # ✅ Used for verification
```

**Status:** ✅ Stripe integration is functional with one handler, needs cleanup

---

## 4. CONVERTKIT EMAIL INTEGRATION AUDIT

### ✅ Implementation Complete

**API Routes:**

| Route | Purpose | Status | Integration |
|-------|---------|--------|-------------|
| `app/api/convertkit/subscribe/route.ts` | General email capture | ✅ Complete | Library downloads |
| `app/api/convertkit/waitlist/route.ts` | Circle waitlist | ✅ Complete | Circle page |
| `app/api/convertkit/webhook/route.ts` | Webhook handler | ✅ Complete | Automation |
| `app/api/convertkit/route.ts` | Generic endpoint | ✅ Complete | General use |

**Environment Variables Required:**
```bash
CONVERTKIT_API_KEY=...           # ✅ Used across all routes
THE_ECO_SYSTEM_ID=...            # Form ID for main list
THE_CoR_WAITLIST_TAG_ID=...      # Tag for Circle waitlist
FOUNDING_TAG_ID=...              # Tag for founding members
```

**Integration Points:**

1. **Library Page** (lines 67-78)
   - Resource downloads trigger ConvertKit subscribe
   - Tags: `library-download`
   - Includes resource name in metadata

2. **Circle Page** (line 114)
   - Calls `/api/convertkit/waitlist`
   - Tags with `THE_CoR_WAITLIST_TAG_ID`
   - Source: `circle-waitlist`

3. **Stripe Webhook** (lines 291-315)
   - Tags new founding members
   - Triggers onboarding sequence
   - Passes first name for personalization

**Code Quality:**
```typescript
// app/api/convertkit/waitlist/route.ts
// ✅ Proper error handling
if (!CONVERTKIT_API_KEY) {
  console.error('[ConvertKit Waitlist] Missing CONVERTKIT_API_KEY')
  return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
}

// ✅ Graceful degradation
if (result.subscription?.subscriber?.id && WAITLIST_TAG_ID) {
  try {
    await fetch(...)  // Tag subscriber
  } catch (tagError) {
    console.error('[ConvertKit Waitlist] Tagging failed:', tagError)
    // Don't fail the whole request if tagging fails
  }
}
```

**Status:** ✅ ConvertKit integration is complete and production-ready

---

## 5. AUTHENTICATION & AUTHORIZATION AUDIT

### User Authentication Flow

**Login Routes:**

| Route | Purpose | Security | Status |
|-------|---------|----------|--------|
| `app/api/auth/login/route.js` | Member login | bcrypt + cookies | ✅ Secure |
| `app/api/admin/login/route.js` | Admin login | bcrypt + cookies + role check | ✅ Secure |

**Password Security:**

`app/api/auth/login/route.js` (lines 24-30):
```javascript
// ✅ Secure password verification
const passwordMatch = await bcrypt.compare(password, user.password)

if (!passwordMatch) {
  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  )
}
```

**Session Management:**

`app/api/admin/login/route.js` (lines 57-62):
```javascript
// ✅ Secure httpOnly cookies
response.cookies.set('admin', JSON.stringify(adminData), {
  httpOnly: true,  // Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'lax',  // CSRF protection
  maxAge: 60 * 60 * 24 * 7  // 7 days
})
```

**Role-Based Access Control:**

`app/api/admin/login/route.js` (lines 18-21):
```javascript
// ✅ Admin role verification
const result = await query(
  'SELECT * FROM users WHERE email = $1 AND role = $2',
  [email.toLowerCase().trim(), 'admin']
)
```

**Password Reset:**

| File | Functionality | Status |
|------|---------------|--------|
| `app/api/auth/request-reset/route.js` | Request reset link | ✅ Implemented |
| `app/api/admin/reset-password/route.js` | Admin password reset | ✅ Implemented |
| `app/(auth)/auth/reset-password/page.tsx` | Reset password UI | ✅ Implemented |

**Frontend Authentication:**

`app/(auth)/auth/login/page.tsx`:
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Secure credential storage (httpOnly cookies)
- ⚠️ Also uses localStorage for user data (line 34) - unnecessary duplication

**Issues Found:**

1. ⚠️ **Dual Storage:** Both cookies AND localStorage used
   ```javascript
   // app/admin/login/page.tsx:34
   localStorage.setItem('admin', JSON.stringify(data.admin))
   ```
   - Cookies are httpOnly (secure) ✅
   - localStorage is not httpOnly (XSS vulnerable) ❌
   - **Recommendation:** Use cookies only, remove localStorage

2. ✅ **Email normalization:** Consistently uses `.toLowerCase().trim()`

3. ✅ **SQL injection protection:** Uses parameterized queries

**Status:** ✅ Authentication is secure with minor localStorage redundancy

---

## 6. FILE STRUCTURE & ROUTING AUDIT

### App Router Structure

**Marketing Routes** (`app/(marketing)/`):

| Route | Page File | Status | Purpose |
|-------|-----------|--------|---------|
| `/` | `page.tsx` | ✅ Exists | Homepage |
| `/about` | `about/page.tsx` | ✅ Exists | About page |
| `/work` | `work/page.tsx` | ✅ Exists | Services/offerings |
| `/circle` | `circle/page.tsx` | ✅ Exists | Circle of Return landing |
| `/circle/welcome` | `circle/welcome/page.tsx` | ✅ Exists | Post-signup welcome |
| `/contact` | `contact/page.tsx` | ✅ Exists | Contact form |
| `/library` | `library/page.tsx` | ✅ Exists | Free resources |
| `/founding` | `founding/page.tsx` | ✅ Exists | Founding members signup |
| `/resources` | `resources/page.tsx` | ✅ Exists | Additional resources |
| `/welcome` | `welcome/page.tsx` | ⚠️ Exists | Duplicate of circle/welcome? |

**Protected Routes** (`app/(protected)/`):

| Route | Page File | Protection | Status |
|-------|-----------|------------|--------|
| `/members` | `members/page.tsx` | Layout | ✅ Dashboard |
| `/videos` | `videos/page.tsx` | Layout | ✅ Video library |
| `/videos/[videoId]` | `videos/[videoId]/page.tsx` | Layout | ✅ Video player |
| `/forum` | `forum/page.tsx` | Layout | ✅ Forum list |
| `/forum/[postId]` | `forum/[postId]/page.tsx` | Layout | ✅ Post detail |
| `/journey` | `journey/page.tsx` | Layout | ✅ User progress |
| `/calls` | `calls/page.tsx` | Layout | ✅ Live calls |
| `/admin` | `admin/page.tsx` | Layout | ⚠️ Duplicate admin area? |

**Admin Routes** (`app/admin/`):

| Route | Page File | Protection | Status |
|-------|-----------|------------|--------|
| `/admin/login` | `login/page.tsx` | Public | ✅ Admin login |
| `/admin/dashboard` | `dashboard/page.tsx` | Role check | ✅ Admin dashboard |
| `/admin/videos/upload` | `videos/upload/page.tsx` | Role check | ✅ Upload videos |
| `/admin/videos/manage` | `videos/manage/page.tsx` | Role check | ✅ Manage videos |
| `/admin/founding` | `founding/page.tsx` | Role check | ✅ Founding members |

**Duplicate/Unused Routes:**

1. ⚠️ `app/(marketing)/welcome/page.tsx` vs `app/(marketing)/circle/welcome/page.tsx`
2. ⚠️ `app/(protected)/admin/page.tsx` vs `app/admin/*` routes
3. ⚠️ `app/test-cookie/page.tsx` - Debug page left in production
4. ⚠️ `app/admin-reset/page.tsx` - Unclear purpose

**Unused Components:**

| Component | Location | Status |
|-----------|----------|--------|
| `components/AskTrue.tsx` | `/components/` | ❌ Not imported anywhere |
| `components/Navigation.tsx` | `/components/` | ⚠️ Duplicate of app/components/Navigation.tsx |
| `components/AskSourceModal.tsx` | `/components/` | ⚠️ Unknown usage |

**Recommendation:**
```bash
# Clean up unused files:
rm app/test-cookie/page.tsx
# Verify and remove duplicates:
# - Check if app/(marketing)/welcome is used vs circle/welcome
# - Consolidate navigation components
# - Archive components/AskTrue.tsx
```

---

## 7. API ROUTES COMPLETENESS AUDIT

### Core API Routes Status

**Authentication APIs:**

| Endpoint | Method | Functionality | Status |
|----------|--------|---------------|--------|
| `/api/auth/login` | POST | Member login | ✅ Complete |
| `/api/auth/register` | POST | Member registration | ✅ Complete |
| `/api/auth/request-reset` | POST | Password reset request | ✅ Complete |
| `/api/admin/login` | POST | Admin login | ✅ Complete |
| `/api/admin/reset-password` | POST | Admin password reset | ✅ Complete |

**Video APIs:**

| Endpoint | Method | Functionality | Status |
|----------|--------|---------------|--------|
| `/api/videos` | GET | List all videos | ✅ Complete |
| `/api/videos` | POST | Create video (admin) | ✅ Complete |
| `/api/videos/[id]` | GET | Get video details | ✅ Complete |
| `/api/videos/[id]` | PUT | Update video | ✅ Complete |
| `/api/videos/[id]` | DELETE | Delete video | ✅ Complete |
| `/api/videos/[id]/comments` | GET/POST | Video comments | ✅ Complete |
| `/api/videos/[id]/reactions` | GET/POST | Video reactions | ✅ Complete |
| `/api/videos/[id]/progress` | GET/POST | Track progress | ✅ Complete |
| `/api/admin/videos` | Multiple | Admin video mgmt | ✅ Complete |

**Forum APIs:**

| Endpoint | Method | Functionality | Status |
|----------|--------|---------------|--------|
| `/api/forum/posts` | GET | List posts | ⚠️ Wrong table names |
| `/api/forum/posts` | POST | Create post | ⚠️ Wrong table names |
| `/api/forum/posts/[id]` | GET | Get post + replies | ✅ Correct tables |
| `/api/forum/posts/[id]/reply` | POST | Add reply | ✅ Complete |
| `/api/forum/posts/[id]/like` | POST | Like/unlike post | ✅ Complete |

**Progress & Activity APIs:**

| Endpoint | Method | Functionality | Status |
|----------|--------|---------------|--------|
| `/api/progress/calculate` | GET | Calculate user progress | ✅ Complete |
| `/api/milestones` | GET/POST | User milestones | ✅ Complete |
| `/api/activity` | GET/POST | Activity logging | ✅ Complete |

**Founding Member APIs:**

| Endpoint | Method | Functionality | Status |
|----------|--------|---------------|--------|
| `/api/founding/count` | GET | Count founding members | ✅ Complete |
| `/api/founding/waitlist` | POST | Join waitlist | ✅ Complete |
| `/api/admin/founding` | GET | Admin view members | ✅ Complete |

**Integration APIs:**

| Endpoint | Method | Functionality | Status |
|----------|--------|---------------|--------|
| `/api/stripe/webhooks` | POST | Stripe events | ✅ Production-ready |
| `/api/webhooks/stripe` | POST | Duplicate stub | ❌ Delete |
| `/api/convertkit/subscribe` | POST | Email subscribe | ✅ Complete |
| `/api/convertkit/waitlist` | POST | Circle waitlist | ✅ Complete |
| `/api/convertkit/webhook` | POST | ConvertKit events | ✅ Complete |
| `/api/ask-di` | POST | AI chat | ⚠️ No knowledge base |

**Missing APIs** (tables exist but no endpoints):

| Table | Missing Endpoint | Priority |
|-------|------------------|----------|
| `notifications` | GET /api/notifications | Medium |
| `practice_entries` | GET/POST /api/practice | Low |
| `live_calls` | GET /api/calls | Medium |
| `call_attendance` | POST /api/calls/[id]/book | Medium |

**Debug/Test Routes** (remove from production):

- `/api/test-db` ← Database connection test
- `/api/debug-login` ← Debug authentication
- `/api/migrate` ← Manual migration runner

---

## 8. FRONTEND COMPONENTS AUDIT

### Component Organization

**Shared Components** (`app/components/`):

| Component | Purpose | Usage | Status |
|-----------|---------|-------|--------|
| `Navigation.tsx` | Main site navigation | All marketing pages | ✅ Active |
| `Footer.tsx` | Site footer | All marketing pages | ✅ Active |
| `MysticalBackground.tsx` | Animated background | Homepage | ✅ Active |
| `GoogleAnalytics.tsx` | GA4 tracking | Root layout | ✅ Active |
| `AskDi.tsx` | AI chat interface | Library page | ✅ Active |
| `CoRCard.tsx` | Circle card component | Unknown | ⚠️ Verify usage |
| `CorCheckout.tsx` | Stripe checkout | Unknown | ⚠️ Verify usage |
| `SoulMirrorQuiz.tsx` | Quiz component | Unknown | ⚠️ Verify usage |
| `VeilLink.tsx` | Custom link component | Unknown | ⚠️ Verify usage |

**Root Components** (`components/`):

| Component | Purpose | Status |
|-----------|---------|--------|
| `Navigation.tsx` | Duplicate navigation? | ⚠️ Check if different from app/components |
| `AskTrue.tsx` | Deprecated AI component | ❌ Not used |
| `AskSourceModal.tsx` | Modal component | ⚠️ Verify usage |
| `DIBox.tsx` | Display component | ⚠️ Verify usage |
| `ui/Reveal.tsx` | Animation component | ⚠️ Verify usage |

### UI Consistency

**Design System:**

`app/globals.css` contains comprehensive CSS custom properties:

```css
/* ✅ Consistent color scheme */
--color-sage: 155, 196, 184;
--color-forest: 127, 176, 105;
--color-dusk: 238, 226, 222;
--color-night: 10, 10, 10;

/* ✅ Typography scale */
--font-family-primary: 'Greater Neue', sans-serif;

/* ✅ Spacing system */
/* ✅ Animation utilities */
```

**Component Consistency:**

✅ All protected pages use consistent layout wrapper
✅ Navigation appears consistently
✅ Footer visibility controlled per route
⚠️ Some inline styles vs CSS modules (founding page)

---

## 9. ENVIRONMENT CONFIGURATION AUDIT

### Required Environment Variables

**Currently Documented** (`.env.local.example`):

```bash
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Actually Required** (found in codebase):

**Database:**
```bash
DATABASE_URL=postgresql://...           # Primary database connection
DATABASE_PUBLIC_URL=postgresql://...    # Public/read connection (optional)
```

**Stripe:**
```bash
STRIPE_SECRET_KEY=sk_live_...          # Stripe API key
STRIPE_WEBHOOK_SECRET=whsec_...        # Webhook signature verification
```

**ConvertKit:**
```bash
CONVERTKIT_API_KEY=...                 # ConvertKit API key
THE_ECO_SYSTEM_ID=...                  # Main form/list ID
THE_CoR_WAITLIST_TAG_ID=...           # Circle waitlist tag
FOUNDING_TAG_ID=...                    # Founding member tag
```

**Email (SMTP):**
```bash
SMTP_HOST=smtp.sendgrid.net            # SMTP server
SMTP_PORT=587                          # SMTP port
SMTP_USER=apikey                       # SMTP username
SMTP_PASS=SG....                       # SMTP password/API key
```

**AI Integration (Optional):**
```bash
OPENAI_API_KEY=sk_...                  # OpenAI API for Ask True
# OR
ANTHROPIC_API_KEY=sk_ant_...           # Alternative to OpenAI
```

**Site Configuration:**
```bash
NEXT_PUBLIC_SITE_URL=https://yourtruenorth.me  # Used in emails
NODE_ENV=production                              # Environment mode
```

**Analytics (Optional):**
```bash
FACEBOOK_PIXEL_ID=...                  # Facebook Pixel tracking
```

**Status:**
❌ `.env.local.example` is incomplete
⚠️ No documentation of required vs optional variables
⚠️ No .env.example with all variables listed

**Recommendation:**
```bash
# Create comprehensive .env.example:
cp .env.local.example .env.example.complete
# Add all variables with descriptions and defaults
```

---

## 10. SECURITY AUDIT

### Security Strengths ✅

1. **Password Hashing:** bcrypt with proper salt rounds
2. **SQL Injection Protection:** Parameterized queries throughout
3. **XSS Protection:** httpOnly cookies for sessions
4. **CSRF Protection:** sameSite cookie attribute
5. **Webhook Signature Verification:** Stripe signature checking
6. **Input Validation:** Content length limits, email validation
7. **HTTPS Enforcement:** Secure cookies in production
8. **Error Messages:** Generic messages (don't leak info)

### Security Concerns ⚠️

1. **Dual Storage (Medium Risk):**
   ```javascript
   // Cookies (secure) + localStorage (not secure)
   localStorage.setItem('admin', JSON.stringify(data.admin))
   ```
   **Fix:** Remove localStorage usage, rely on httpOnly cookies only

2. **Database Connection in Webhooks:**
   ```javascript
   // Creates new client each time
   const client = new Client({ connectionString: ... })
   ```
   **Fix:** Use connection pooling (pg.Pool) to prevent connection exhaustion

3. **Missing Rate Limiting:**
   - No rate limiting on login endpoints
   - No brute force protection
   - No CAPTCHA on public forms

4. **Debug Endpoints in Production:**
   - `/api/test-db` - exposes database connection status
   - `/api/debug-login` - debug authentication flow
   - `/api/migrate` - manual migration runner
   - **Fix:** Remove or add admin-only protection

5. **Environment Variable Exposure:**
   - Some routes log API keys on error (check console logs)
   - **Fix:** Sanitize all console.error calls

### Security Recommendations

**Immediate (High Priority):**
```javascript
// 1. Remove localStorage usage
// app/admin/login/page.tsx:34
- localStorage.setItem('admin', JSON.stringify(data.admin))

// 2. Add rate limiting to auth routes
import rateLimit from 'express-rate-limit'
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5  // 5 attempts
})

// 3. Remove debug endpoints
rm app/api/test-db/route.js
rm app/api/debug-login/route.js
```

**Medium Priority:**
- Implement CAPTCHA on public forms (founding, contact)
- Add content security policy headers
- Implement request timeout limits
- Add logging/monitoring for failed auth attempts

---

## 11. PERFORMANCE & OPTIMIZATION AUDIT

### Build & Dependencies

**Package Analysis:**

| Category | Packages | Size Impact |
|----------|----------|-------------|
| Core Framework | next, react, react-dom | High (expected) |
| Database | pg, @prisma/client | Medium |
| Auth | bcrypt, bcryptjs, jsonwebtoken | Low |
| Payment | stripe | Low |
| AI | openai | Medium |
| Email | @sendgrid/mail, nodemailer | Low |
| Animations | framer-motion, three | High |
| Icons | lucide-react | Medium |

**Issues:**

1. ⚠️ **Duplicate bcrypt:** Both `bcrypt` and `bcryptjs` installed
   ```json
   "bcrypt": "^6.0.0",
   "bcryptjs": "^3.0.2",
   ```
   **Fix:** Choose one (bcryptjs for better compatibility)

2. ⚠️ **Prisma unused:** `@prisma/client` installed but not used
   - Uses raw `pg` queries everywhere
   - Prisma schema files missing
   - **Fix:** Remove if not needed, or migrate to Prisma

3. ⚠️ **Heavy 3D library:** `three` (3D graphics) - used for mystical background
   - Large bundle size impact
   - Only used on homepage
   - **Fix:** Consider code splitting or lighter alternative

4. ⚠️ **SendGrid + Nodemailer:** Two email libraries
   ```json
   "@sendgrid/mail": "^8.1.6",
   "nodemailer": "^7.0.6",
   ```
   **Fix:** Consolidate to one library

### Database Performance

**Indexes:** ✅ Comprehensive indexes defined in migrations

**Query Patterns:**
- ✅ Uses COUNT for aggregation
- ✅ Proper JOINs for related data
- ⚠️ N+1 query potential in forum (fetch posts, then replies separately)
- ⚠️ No connection pooling (creates new client each request)

**Recommendations:**
```javascript
// Use pg.Pool instead of individual clients
import { Pool } from 'pg'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

### Frontend Performance

**Images:**
- ⚠️ No Next.js Image component usage
- ⚠️ No image optimization configured
- ⚠️ Profile photos stored as base64 in database (inefficient)

**Code Splitting:**
- ✅ App Router provides automatic code splitting
- ⚠️ Heavy libraries (Three.js) not lazy loaded

**Recommendations:**
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'
const MysticalBackground = dynamic(() => import('./MysticalBackground'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})
```

---

## 12. TESTING & DOCUMENTATION

### Testing Status

**Unit Tests:** ❌ None found
**Integration Tests:** ❌ None found
**E2E Tests:** ❌ None found

**Test Framework:** Not installed

### Documentation Status

**Found Documentation:**

| Document | Purpose | Quality |
|----------|---------|---------|
| `README.md` | Project overview | ⚠️ Minimal |
| `ASK_TRUE_NORTH_SETUP.md` | AI setup guide | ✅ Excellent |
| `COMMUNITY-AUDIT.md` | Community platform audit | ✅ Excellent |
| `EMAIL_SETUP_GUIDE.md` | Email configuration | ✅ Good |
| `RESET_PASSWORD_IMPLEMENTATION.md` | Password reset docs | ✅ Good |
| Various audit reports | Historical work | ⚠️ Cluttered |

**Missing Documentation:**

- ❌ API documentation (endpoints, parameters, responses)
- ❌ Database schema documentation
- ❌ Deployment guide
- ❌ Environment variables reference (comprehensive)
- ❌ Contributing guidelines
- ❌ Troubleshooting guide

**Recommendation:**
```bash
# Create docs/ directory with:
docs/
├── API.md              # API endpoint reference
├── DATABASE.md         # Schema documentation
├── DEPLOYMENT.md       # Deployment process
├── ENVIRONMENT.md      # All env variables
└── TROUBLESHOOTING.md  # Common issues
```

---

## 13. CRITICAL BUGS SUMMARY

### 🔴 Critical (Immediate Action Required)

1. **Forum Table Inconsistency**
   - **Impact:** Forum features may be broken in production
   - **Location:** `app/api/forum/posts/route.js` vs other forum routes
   - **Fix:** Verify production table names, update all routes consistently

2. **Ask True Non-Functional**
   - **Impact:** Feature appears but doesn't work (poor UX)
   - **Location:** `lib/mason-knowledge-base.ts`
   - **Fix:** Populate knowledge base OR remove feature from UI

### ⚠️ High Priority

3. **Duplicate Stripe Webhooks**
   - **Impact:** Confusion, potential bugs, maintenance burden
   - **Location:** Two webhook handlers exist
   - **Fix:** Delete unused handler, verify Stripe configuration

4. **Database Migrations Don't Match Production**
   - **Impact:** Cannot recreate database from migrations
   - **Location:** Migration files vs actual production
   - **Fix:** Create migration to align with production reality

5. **Debug Endpoints in Production**
   - **Impact:** Security risk, information disclosure
   - **Location:** `/api/test-db`, `/api/debug-login`, `/api/migrate`
   - **Fix:** Remove or add admin protection

### Medium Priority

6. **localStorage Security Risk**
   - **Impact:** XSS vulnerability for admin sessions
   - **Location:** Admin login page
   - **Fix:** Remove localStorage, use cookies only

7. **Duplicate Dependencies**
   - **Impact:** Larger bundle size, confusion
   - **Location:** bcrypt/bcryptjs, SendGrid/nodemailer
   - **Fix:** Consolidate to one library each

8. **No Connection Pooling**
   - **Impact:** Performance degradation under load
   - **Location:** Webhook handlers, various API routes
   - **Fix:** Implement pg.Pool

---

## 14. PRIORITIZED RECOMMENDATIONS

### Phase 1: Critical Fixes (Do Today)

1. **Verify Forum Table Names**
   ```sql
   -- Connect to production database
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name LIKE '%post%';
   ```

2. **Fix Forum API Consistency**
   - If DB has `community_posts`: Revert commit 887fa0b
   - If DB has `forum_posts`: Update [id]/route.js to match

3. **Remove or Fix Ask True**
   - Option A: Hide feature until knowledge base populated
   - Option B: Populate knowledge base immediately
   - Option C: Remove from library page UI

4. **Delete Duplicate Stripe Webhook**
   ```bash
   rm app/api/webhooks/stripe/route.ts
   ```

5. **Remove Debug Endpoints**
   ```bash
   rm app/api/test-db/route.js
   rm app/api/debug-login/route.js
   # Or add admin-only protection
   ```

### Phase 2: High Priority (This Week)

6. **Create Missing Migration**
   - Document actual production schema
   - Create migration file matching reality
   - Update migration docs

7. **Remove localStorage Usage**
   ```javascript
   // app/admin/login/page.tsx
   - localStorage.setItem('admin', JSON.stringify(data.admin))
   ```

8. **Implement Connection Pooling**
   ```javascript
   // lib/db.js - replace Client with Pool
   import { Pool } from 'pg'
   export const pool = new Pool({...})
   ```

9. **Consolidate Dependencies**
   ```bash
   npm uninstall bcrypt  # Keep bcryptjs
   npm uninstall @prisma/client prisma  # If not using
   # Choose: SendGrid OR nodemailer
   ```

10. **Add Rate Limiting**
    ```bash
    npm install express-rate-limit
    # Apply to auth endpoints
    ```

### Phase 3: Medium Priority (This Month)

11. **Performance Optimization**
    - Lazy load Three.js (MysticalBackground)
    - Implement Next.js Image component
    - Add image CDN/optimization

12. **Documentation**
    - Create comprehensive API docs
    - Document all environment variables
    - Create deployment runbook

13. **Testing**
    - Add Jest + Testing Library
    - Write tests for critical paths (auth, payments)
    - Add E2E tests for core flows

14. **Monitoring**
    - Add error tracking (Sentry)
    - Add performance monitoring
    - Set up uptime monitoring

15. **Code Cleanup**
    - Remove unused components (AskTrue.tsx, etc.)
    - Remove duplicate pages
    - Clean up old audit reports

### Phase 4: Nice-to-Have (Future)

16. **Missing API Features**
    - Implement notifications API
    - Implement practice tracking API
    - Implement live calls booking API

17. **Security Enhancements**
    - Add CAPTCHA to forms
    - Implement CSP headers
    - Add 2FA for admin accounts

18. **UX Improvements**
    - Add loading skeletons
    - Improve error messages
    - Add optimistic UI updates

---

## 15. ENVIRONMENT VARIABLES REFERENCE

### Complete List of Required Variables

```bash
# ============================================================================
# DATABASE (Required)
# ============================================================================
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DATABASE_PUBLIC_URL=postgresql://user:pass@host:5432/dbname  # Optional read replica

# ============================================================================
# STRIPE (Required for payments)
# ============================================================================
STRIPE_SECRET_KEY=sk_live_...                    # Stripe API secret key
STRIPE_WEBHOOK_SECRET=whsec_...                  # Webhook signature secret

# ============================================================================
# CONVERTKIT (Required for email marketing)
# ============================================================================
CONVERTKIT_API_KEY=...                           # ConvertKit API key
THE_ECO_SYSTEM_ID=...                            # Main form/list ID
THE_CoR_WAITLIST_TAG_ID=...                      # Circle waitlist tag ID
FOUNDING_TAG_ID=...                              # Founding member tag ID

# ============================================================================
# EMAIL - SMTP (Required for transactional emails)
# ============================================================================
SMTP_HOST=smtp.sendgrid.net                      # SMTP server hostname
SMTP_PORT=587                                    # SMTP port (usually 587)
SMTP_USER=apikey                                 # SMTP username
SMTP_PASS=SG....                                 # SMTP password/API key

# ============================================================================
# AI INTEGRATION (Optional - for Ask True feature)
# ============================================================================
OPENAI_API_KEY=sk_...                            # OpenAI API key
# OR
ANTHROPIC_API_KEY=sk_ant_...                     # Anthropic Claude API key

# ============================================================================
# SITE CONFIGURATION (Required)
# ============================================================================
NEXT_PUBLIC_SITE_URL=https://yourtruenorth.me    # Full site URL (for emails)
NODE_ENV=production                              # Environment mode

# ============================================================================
# ANALYTICS (Optional)
# ============================================================================
FACEBOOK_PIXEL_ID=...                            # Facebook Pixel tracking ID
# Note: GA4 tracking ID is hardcoded in GoogleAnalytics.tsx component

# ============================================================================
# DEVELOPMENT ONLY (Not needed in production)
# ============================================================================
# None currently
```

### Variable Usage Matrix

| Variable | Used By | Critical? | Default |
|----------|---------|-----------|---------|
| `DATABASE_URL` | All API routes | ✅ Yes | None |
| `STRIPE_SECRET_KEY` | Webhooks | ✅ Yes | None |
| `STRIPE_WEBHOOK_SECRET` | Webhooks | ✅ Yes | None |
| `CONVERTKIT_API_KEY` | Email routes | ✅ Yes | None |
| `SMTP_HOST` | Welcome emails | ✅ Yes | None |
| `SMTP_USER` | Welcome emails | ✅ Yes | None |
| `SMTP_PASS` | Welcome emails | ✅ Yes | None |
| `OPENAI_API_KEY` | Ask True | ❌ No | None (falls back) |
| `NEXT_PUBLIC_SITE_URL` | Email templates | ⚠️ Recommended | None |
| `FACEBOOK_PIXEL_ID` | Analytics | ❌ No | None |

---

## 16. CONCLUSION

### Overall Assessment

The True North website is a **functional production system** with most core features working properly. However, **critical database inconsistencies** and **incomplete features** pose risks that must be addressed immediately.

**Strengths:**
- ✅ Secure authentication and authorization
- ✅ Complete Stripe integration for payments
- ✅ Robust ConvertKit email marketing setup
- ✅ Well-structured Next.js App Router architecture
- ✅ Comprehensive database schema (when consistent)
- ✅ Production-ready webhook handlers

**Critical Weaknesses:**
- 🔴 Forum API table name inconsistencies (production risk)
- 🔴 Ask True feature non-functional (bad UX)
- ⚠️ Database migrations don't match production
- ⚠️ Duplicate code and unused components
- ⚠️ Missing documentation and tests

### Risk Assessment

**Current Production Risk: MEDIUM-HIGH**

The site is operational, but the forum table inconsistency could break features at any time. The impact depends on which table names production actually uses.

**Recommended Action Plan:**

1. **TODAY:** Verify production database table names
2. **TODAY:** Fix forum API to use consistent table names
3. **THIS WEEK:** Hide or fix Ask True feature
4. **THIS WEEK:** Remove duplicate webhook handler
5. **THIS WEEK:** Remove debug endpoints
6. **THIS MONTH:** Address performance and security issues

### Final Recommendation

**DO NOT deploy any changes** until the forum table name issue is resolved. Once fixed, the platform is stable enough for continued operation with 2-30 members. Address the prioritized recommendations in phases to improve stability and prepare for growth.

---

**Audit completed:** November 1, 2025
**Next review recommended:** After Phase 1 fixes completed

---
