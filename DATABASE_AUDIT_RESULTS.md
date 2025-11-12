# Database Audit Results
**Date:** November 1, 2025
**Purpose:** Document database schema based on migrations and code references

---

## Tables Defined in Migrations

Based on migration files in `/migrations/`:

### Migration 001: Video Interaction Tables
- `videos` - Video content storage
- `comments` - Video comments
- `reactions` - Video reactions (like, love, insightful)
- `activity_log` - User engagement tracking

**User table additions:**
- `photo` (TEXT)
- `bio` (TEXT)
- `level` (VARCHAR(50), default: 'Seeker')
- `points` (INTEGER, default: 0)

### Migration 002: Members Portal Schema
- `videos` - Video content (duplicate definition - may conflict with 001)
- `user_video_progress` - Video completion tracking
- `video_comments` - Video comments (duplicate of `comments`?)
- `video_reactions` - Video reactions (duplicate of `reactions`?)
- `user_milestones` - Milestone achievements
- `live_calls` - Scheduled live calls
- `call_attendance` - Call booking/attendance tracking
- `community_posts` - Forum posts (main table)
- `post_replies` - Forum post replies
- `post_reactions` - Forum post reactions
- `resources` - Downloadable resources
- `resource_downloads` - Resource download tracking
- `practice_entries` - Daily practice tracking
- `notifications` - User notifications

**User table additions:**
- `profile_photo` (TEXT)
- `bio` (TEXT) - duplicate of 001
- `level` (VARCHAR(50)) - duplicate of 001
- `progress` (INTEGER, default: 0)
- `current_streak` (INTEGER, default: 0)
- `last_practice_date` (DATE)

### Migration 003: Founding Members
- `founding_members` - Founding member tracking
- `founding_waitlist` - Waitlist when spots fill

**User table additions:**
- `founding_member` (BOOLEAN, default: false)
- `stripe_customer_id` (VARCHAR(255))
- `stripe_subscription_id` (VARCHAR(255))
- `subscription_status` (VARCHAR(50), default: 'active')

### Migration 004: Admin and Likes
- `post_likes` - Forum post likes
- `reply_likes` - Forum reply likes

**User table additions:**
- `role` (VARCHAR(20), default: 'member')

**Video table additions:**
- `featured` (BOOLEAN, default: false)
- `published` (BOOLEAN, default: true)

---

## Tables Used by Code

Based on API route analysis:

### Authentication & Users
- `users` - Main user table ✅

### Forum/Community
- `community_posts` - Forum posts ✅ (migrations define this)
- `post_replies` - Forum replies ✅ (migrations define this)
- `post_likes` - Forum post likes ✅ (migrations define this)
- `reply_likes` - Reply likes ✅ (migrations define this)

### Videos
- `videos` - Video content ✅
- `comments` - Video comments ✅ (from migration 001)
- `reactions` - Video reactions ✅ (from migration 001)
- `user_video_progress` - User progress ✅ (from migration 002)

### Founding Members
- `founding_members` - Founding member tracking ✅
- `founding_waitlist` - Waitlist ✅

### Live Calls
- `live_calls` - Call scheduling ✅
- `call_attendance` - Attendance tracking ✅

### Admin
- Uses `users.role` column ✅

---

## Inconsistencies Found

### ✅ RESOLVED: Forum Table Names
**Previous Issue:** API code used inconsistent table names
- Main posts route used: `forum_posts`, `forum_replies`, `forum_likes` ❌
- Detail/like/reply routes used: `community_posts`, `post_replies`, `post_likes` ✅

**Resolution:** Updated main posts route to use `community_posts`, `post_replies`, `post_likes` consistently (November 1, 2025)

### Potential Duplicates
1. **Video Tables:**
   - Migration 001 creates: `videos`, `comments`, `reactions`
   - Migration 002 creates: `videos`, `video_comments`, `video_reactions`
   - **Impact:** May cause conflicts if both migrations run
   - **Recommendation:** Verify which tables actually exist in production

2. **User Columns:**
   - Migration 001 adds: `bio`, `level`, `points`
   - Migration 002 adds: `bio`, `level`, `progress`, `current_streak`, `last_practice_date`, `profile_photo`
   - **Impact:** Some columns defined twice (bio, level)
   - **Recommendation:** Migrations use `IF NOT EXISTS`, so should be safe

---

## Tables Defined But Unused by API

These tables exist in migrations but have no API endpoints:

1. `notifications` - Created in migration 002
   - **Missing:** GET /api/notifications
   - **Impact:** Users can't view notifications

2. `practice_entries` - Created in migration 002
   - **Missing:** GET/POST /api/practice
   - **Impact:** Practice tracking feature not functional

3. `user_milestones` - Created in migration 002
   - **Has API:** /api/milestones ✅

4. `resources` - Created in migration 002
   - **Missing:** GET /api/resources
   - **Impact:** Resource library not functional from DB

5. `resource_downloads` - Created in migration 002
   - **Missing:** Tracking endpoint
   - **Impact:** Download statistics not tracked

6. `activity_log` - Created in migration 001
   - **Has API:** /api/activity ✅

---

## Expected Database Schema

### Core Tables (Confirmed Active)
```sql
users                    -- User accounts
community_posts          -- Forum posts
post_replies            -- Forum replies
post_likes              -- Forum post likes
reply_likes             -- Reply likes
videos                  -- Video content
comments                -- Video comments
reactions               -- Video reactions
founding_members        -- Founding member tracking
founding_waitlist       -- Waitlist
```

### Supporting Tables (Confirmed Active)
```sql
user_video_progress     -- Video completion tracking
live_calls              -- Live call scheduling
call_attendance         -- Call attendance
activity_log            -- User activity
user_milestones         -- Achievement tracking
```

### Defined But Inactive
```sql
notifications           -- No API endpoint
practice_entries        -- No API endpoint
resources               -- No API endpoint
resource_downloads      -- No API endpoint
video_comments          -- Duplicate? Unused?
video_reactions         -- Duplicate? Unused?
post_reactions          -- Unused (have post_likes instead)
```

---

## Migration Order Recommendations

Current migration files should be run in order:
1. `001_add_video_interaction_tables.sql`
2. `002_members_portal_schema.sql`
3. `003_founding_members.sql`
4. `004_admin_and_likes.sql`

**Note:** Migrations use `IF NOT EXISTS` clauses, so running them multiple times is safe.

---

## Action Items for Production

### Immediate (Required for Code to Work)
1. ✅ Ensure `community_posts` table exists (not `forum_posts`)
2. ✅ Ensure `post_replies` table exists (not `forum_replies`)
3. ✅ Ensure `post_likes` table exists (not `forum_likes`)

### Verification Needed
To verify actual production database, run:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- activity_log
- call_attendance
- comments
- community_posts
- founding_members
- founding_waitlist
- live_calls
- notifications
- post_likes
- post_replies
- practice_entries
- reactions
- reply_likes
- resource_downloads
- resources
- user_milestones
- user_video_progress
- users
- video_comments (maybe)
- video_reactions (maybe)
- videos

### Cleanup Recommendations (Future)
1. Determine if `video_comments` and `comments` are duplicates
2. Determine if `video_reactions` and `reactions` are duplicates
3. Remove unused table definitions from migrations if confirmed duplicates
4. Consider adding missing API endpoints for:
   - notifications
   - practice_entries
   - resources
   - resource_downloads

---

## Database Column Naming Convention

**Inconsistency Found:**
- Some tables use snake_case: `user_id`, `created_at`, `post_id`
- Some tables use camelCase in migration 001: `createdat`, `updatedat`, `youtubeurl`, `videoid`, `userid`

**Impact:** Code uses both conventions in different places

**Recommendation:** Standardize on snake_case (PostgreSQL convention)

---

**Audit Completed:** November 1, 2025
**Status:** Code now consistent with migration-defined table names
**Next Step:** Verify actual production database matches this documentation
