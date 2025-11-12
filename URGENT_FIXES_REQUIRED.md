# URGENT FIXES REQUIRED - True North Website

**Date:** November 1, 2025
**Priority:** CRITICAL
**Estimated Time:** 2-4 hours

---

## 🔴 CRITICAL - DO FIRST (Today)

### 1. Forum Table Name Crisis

**Problem:** Forum API uses inconsistent database table names across different routes.

**Evidence:**
- Main route (`/api/forum/posts/route.js`) uses: `forum_posts`, `forum_replies`, `forum_likes`
- Detail route (`/api/forum/posts/[id]/route.js`) uses: `community_posts`, `post_replies`
- Like route uses: `post_likes`
- Reply route uses: `post_replies`
- Database migrations define: `community_posts`, `post_replies`, `post_likes`

**Impact:** Forum may be completely broken in production (depends on actual table names)

**Action Required:**
```bash
# Step 1: Check production database
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%post%' ORDER BY table_name;"

# Step 2a: If production has community_posts tables:
git revert 887fa0b  # Revert the forum fix commit

# Step 2b: If production has forum_posts tables:
# Update these files to use forum_posts everywhere:
# - app/api/forum/posts/[id]/route.js
# - app/api/forum/posts/[id]/like/route.js (change post_likes to forum_likes)
# - app/api/forum/posts/[id]/reply/route.js (change post_replies to forum_replies)
```

**Time:** 30 minutes

---

### 2. Ask True Feature - Non-Functional

**Problem:** "Ask True" AI feature shows in UI but returns placeholder responses.

**Evidence:**
- `lib/mason-knowledge-base.ts` contains only `[Add your content here]` placeholders
- No `OPENAI_API_KEY` configured
- Users see feature but get generic fallback responses

**Impact:** Poor user experience, feature appears broken

**Action Required (Choose ONE):**

**Option A - Hide Feature (Quick Fix):**
```typescript
// app/(marketing)/library/page.tsx
// Comment out or remove the Ask DI button and modal
```

**Option B - Complete Feature:**
```bash
# 1. Populate lib/mason-knowledge-base.ts with actual content (2-3 hours)
# 2. Add OPENAI_API_KEY to production environment
# 3. Test with real questions
```

**Option C - Remove Completely:**
```bash
# If not needed, remove:
rm app/api/ask-di/route.ts
rm lib/mason-knowledge-base.ts
# Update library page to remove Ask DI UI
```

**Time:** 15 minutes (hide) OR 3 hours (complete) OR 30 minutes (remove)

---

### 3. Delete Duplicate Stripe Webhook

**Problem:** Two Stripe webhook handlers exist in codebase.

**Evidence:**
- `app/api/stripe/webhooks/route.js` - 387 lines, production-ready ✅
- `app/api/webhooks/stripe/route.ts` - 79 lines, mock/stub ❌

**Impact:** Confusion, potential bugs, maintenance burden

**Action Required:**
```bash
# Delete the stub implementation
rm app/api/webhooks/stripe/route.ts

# Verify Stripe webhook URL in dashboard points to:
# https://yourtruenorth.me/api/stripe/webhooks
```

**Time:** 5 minutes

---

### 4. Remove Debug Endpoints from Production

**Problem:** Debug/test API routes exposed in production.

**Evidence:**
- `/api/test-db` - Database connection test
- `/api/debug-login` - Debug authentication
- `/api/migrate` - Manual migration runner

**Impact:** Security risk, information disclosure

**Action Required:**
```bash
rm app/api/test-db/route.js
rm app/api/debug-login/route.js

# For migrate route, either delete or add admin protection:
# Option A: rm app/api/migrate/route.js
# Option B: Add admin role check to route
```

**Time:** 10 minutes

---

## ⚠️ HIGH PRIORITY (This Week)

### 5. Fix localStorage Security Issue

**Problem:** Admin sessions stored in both cookies AND localStorage.

**Evidence:**
```javascript
// app/admin/login/page.tsx:34
localStorage.setItem('admin', JSON.stringify(data.admin))
```

**Impact:** XSS vulnerability (localStorage is not httpOnly)

**Action Required:**
```javascript
// app/admin/login/page.tsx
// Remove line 34:
- localStorage.setItem('admin', JSON.stringify(data.admin))

// Session is already in httpOnly cookie (secure)
```

**Time:** 5 minutes

---

### 6. Create Migration for Production Schema

**Problem:** Migration files don't match production database reality.

**Evidence:**
- Migrations define `community_posts`
- Production might use `forum_posts` (unknown until checked)

**Impact:** Cannot recreate database from migrations

**Action Required:**
```sql
-- After fixing issue #1, create migration to document reality
-- migrations/005_fix_forum_table_names.sql

-- If production uses forum_posts:
ALTER TABLE community_posts RENAME TO forum_posts;
ALTER TABLE post_replies RENAME TO forum_replies;
ALTER TABLE post_likes RENAME TO forum_likes;

-- OR document that migrations 002/004 should use forum_ names
```

**Time:** 30 minutes

---

### 7. Implement Database Connection Pooling

**Problem:** Each API request creates new database client.

**Evidence:**
```javascript
// app/api/stripe/webhooks/route.js
const client = new Client({ connectionString: ... })
await client.connect()
```

**Impact:** Performance degradation, connection exhaustion under load

**Action Required:**
```javascript
// lib/db.js - Update from Client to Pool
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const query = (text, params) => pool.query(text, params)
```

**Time:** 1 hour (test all endpoints after change)

---

### 8. Consolidate Duplicate Dependencies

**Problem:** Multiple packages for same purpose.

**Evidence:**
```json
"bcrypt": "^6.0.0",
"bcryptjs": "^3.0.2",
"@sendgrid/mail": "^8.1.6",
"nodemailer": "^7.0.6",
```

**Impact:** Larger bundle size, confusion

**Action Required:**
```bash
# Choose bcryptjs (better compatibility)
npm uninstall bcrypt

# Choose nodemailer (already in use by webhooks)
npm uninstall @sendgrid/mail

# If Prisma not used:
npm uninstall @prisma/client prisma
```

**Time:** 30 minutes (regression test after removal)

---

### 9. Add Rate Limiting to Auth Endpoints

**Problem:** No brute force protection on login.

**Impact:** Security vulnerability

**Action Required:**
```bash
npm install express-rate-limit

# Add to auth routes:
# - /api/auth/login
# - /api/admin/login
# - /api/auth/request-reset
```

**Time:** 1 hour

---

## 📋 MEDIUM PRIORITY (This Month)

### 10. Clean Up Unused Files

**Problem:** Duplicate and unused components in codebase.

**Action Required:**
```bash
# Deprecated components
rm components/AskTrue.tsx  # Not used anywhere

# Duplicate pages (verify first)
# app/(marketing)/welcome vs app/(marketing)/circle/welcome

# Test pages
rm app/test-cookie/page.tsx
```

**Time:** 30 minutes

---

### 11. Add Comprehensive Documentation

**Problem:** Missing API docs, environment variable reference.

**Action Required:**
```bash
mkdir docs
# Create:
# - docs/API.md (all endpoints)
# - docs/ENVIRONMENT.md (all variables with descriptions)
# - docs/DATABASE.md (schema documentation)
# - docs/DEPLOYMENT.md (deploy process)
```

**Time:** 4 hours

---

### 12. Implement Monitoring & Error Tracking

**Problem:** No error tracking or uptime monitoring.

**Action Required:**
```bash
npm install @sentry/nextjs
# Configure Sentry
# Add uptime monitoring (UptimeRobot, Better Stack, etc.)
```

**Time:** 2 hours

---

## QUICK WINS (Do These Anytime)

### Update .env.example

**Current:** Only has OpenAI key
**Needed:** All required variables

```bash
# Update .env.local.example with:
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CONVERTKIT_API_KEY=
THE_ECO_SYSTEM_ID=
THE_CoR_WAITLIST_TAG_ID=
FOUNDING_TAG_ID=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
NEXT_PUBLIC_SITE_URL=
OPENAI_API_KEY=  # Optional
```

**Time:** 10 minutes

---

## TESTING CHECKLIST (After Fixes)

After completing critical fixes, test:

```bash
# 1. Forum functionality
# - Create new post
# - View post detail
# - Add reply
# - Like post

# 2. Founding member signup
# - Complete Stripe checkout (test mode)
# - Verify user created
# - Verify welcome email sent
# - Verify ConvertKit tag applied

# 3. Admin login
# - Login as admin
# - Verify session works
# - Check localStorage is NOT used
# - Upload video
# - View dashboard

# 4. Ask True (if keeping)
# - Open library page
# - Ask question
# - Verify real response (not fallback)
```

---

## ESTIMATED TOTAL TIME

| Priority | Tasks | Time |
|----------|-------|------|
| Critical | 4 tasks | 1-4.5 hours |
| High | 5 tasks | 3.5 hours |
| Medium | 3 tasks | 6.5 hours |
| **TOTAL** | **12 tasks** | **11-14 hours** |

---

## RECOMMENDED SEQUENCE

**Day 1 (Today):**
1. Check production database table names (15 min)
2. Fix forum table consistency (30 min)
3. Hide or remove Ask True feature (15 min)
4. Delete duplicate Stripe webhook (5 min)
5. Remove debug endpoints (10 min)
**Total: 1.25 hours**

**Day 2:**
1. Fix localStorage issue (5 min)
2. Implement connection pooling (1 hour)
3. Remove duplicate dependencies (30 min)
4. Update .env.example (10 min)
**Total: 1.75 hours**

**Day 3:**
1. Add rate limiting (1 hour)
2. Create missing migration (30 min)
3. Clean up unused files (30 min)
**Total: 2 hours**

**Week 2:**
1. Add monitoring (2 hours)
2. Write documentation (4 hours)

---

## BLOCKERS / QUESTIONS

Before starting, clarify:

1. **Production database access** - Can you connect to verify table names?
2. **Ask True decision** - Hide, complete, or remove?
3. **Stripe webhook endpoint** - Which URL is configured in Stripe dashboard?
4. **Admin access** - Who needs to approve production changes?

---

**Created:** November 1, 2025
**For full details:** See TECHNICAL_AUDIT_REPORT.md
