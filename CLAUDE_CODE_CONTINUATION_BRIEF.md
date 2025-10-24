# Claude Code Continuation Brief - True North Website

## Session Information
**Branch**: `claude/retrieve-archived-session-info-011CUSFzeWzQed3zuTZn9FHe`
**Project**: True North Website V2
**Previous Session ID**: 011CUKhw3KqCPWBgXshsoH12 (completed)
**Date**: October 24, 2025

---

## Executive Summary

This project is a transformation coaching website for Mason (True North). The previous Claude Code session completed major overnight work including:
- Critical security fixes (removed fake login page with exposed credentials)
- SEO and mobile improvements
- Video playback system with YouTube embeds
- Comments and likes system
- Member access control
- AI-powered "Ask True North" widget

**All features are built and committed to feature branches, ready for deployment.**

---

## Project Architecture

### Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Hosting**: Vercel (auto-deploys from main branch)
- **Authentication**: JWT + bcrypt
- **APIs**: Zoom integration, OpenAI integration
- **Storage**: localStorage for client-side data (likes, comments)

### Key Directories
```
/app
├── /api              # API routes (17 total)
│   ├── /auth         # Login, register, reset password
│   ├── /zoom         # Zoom meeting creation
│   └── /ask-di       # AI Q&A widget
├── /components       # Reusable UI components
├── /auth             # Auth pages (login, register, reset)
├── /journey          # Protected: Member video library
├── /members          # Protected: Member portal
├── /admin            # Protected: Admin dashboard
└── /library          # Public: Library with AI widget

/lib
├── firebaseAdmin.ts       # Firebase setup (initialized but unused)
├── mason-knowledge-base.ts # AI knowledge base (needs user content)
└── database.js            # Database service layer

/prisma
└── schema.prisma          # Database schema
```

---

## Critical Security Issues FIXED

### 1. Fake Login Page Removed ✅
**CRITICAL**: Found and deleted `/app/login/page.tsx` which had:
- Hardcoded admin credentials in plain text: `mason@truenorth.com / admin123`
- Fake localStorage authentication
- Credentials visible in source code

**Resolution**: Deleted fake login, only secure login remains at `/app/auth/login/page.tsx`

### 2. Authentication Security ✅
- Proper bcrypt password hashing
- JWT tokens with httpOnly cookies
- Secure cookies in production
- Parameterized queries (SQL injection prevention)

---

## Features Completed

### Feature 1: Video Playback System ✅
**File**: `app/journey/page.tsx`

- YouTube iframe embeds (16:9 responsive)
- Modal with smooth animations
- Each video has `youtubeId` field
- Full YouTube controls

### Feature 2: Comments System ✅
**Storage**: localStorage key `videoComments`

- Members can comment on videos
- Shows user avatar (first initial circle)
- Timestamps for each comment
- Data format: `{ videoId: [{ id, text, userName, timestamp }] }`
- Survives page refresh

### Feature 3: Likes/Reactions ✅
**Storage**: localStorage key `videoLikes`

- Heart button toggles like/unlike
- Button turns red when liked
- Like count updates dynamically
- Data format: `{ videoId: true/false }`
- Persists across sessions

### Feature 4: Member Access Control ✅
**Protected Pages**:
- `/journey` - Requires login
- `/members` - Requires login
- `/admin` - Requires admin role

**Security**:
- Validates user data structure
- Clears corrupted localStorage
- Uses `window.location.replace()` for redirects
- Logout clears all user data

### Feature 5: AI-Powered Widget ✅
**Files**:
- `app/api/ask-di/route.ts` - OpenAI API integration
- `app/library/page.tsx` - Frontend widget
- `lib/mason-knowledge-base.ts` - Knowledge base (needs user content)

**Features**:
- 3 free questions per session
- Uses GPT-4 by default
- Answers based on Mason's teachings
- Fallback responses if API fails

**Setup Required**:
- User needs to add `OPENAI_API_KEY` to environment
- User needs to fill `mason-knowledge-base.ts` with actual teachings

---

## SEO & Mobile Improvements ✅

### Metadata Enhanced
**File**: `app/layout.tsx`

- Better title: "True North - Transformation Through Embodiment | Mason"
- Comprehensive description with key offerings
- SEO keywords: masculine transformation, breathwork, energy healing
- Open Graph tags for social sharing
- Author metadata
- Theme color for mobile browsers

### Mobile Responsiveness
- Added viewport meta tag (proper scaling on mobile)
- Identified 19 hardcoded pixel widths that may need review

---

## Known Issues (NOT Fixed - Need Decisions)

### 1. Duplicate Navigation Bars
**Severity**: MEDIUM
**Affected Pages**: Homepage, About, Work, Contact, Library, Circle, Resources

**Issue**: Root layout renders `<Navigation />` AND individual pages also render it

**Recommendation**: Either:
1. Remove `<Navigation />` from individual pages (let root layout handle it)
2. Create route groups `(auth)` and `(marketing)` for layout separation

### 2. Reset Password Functionality
**Severity**: LOW
**Status**: Page exists but may not be fully wired

**To verify**:
- Check database has `reset_token` and `reset_expires` columns
- Verify email sending is configured

### 3. Unused Image Assets
**Severity**: LOW

Found several image files with spaces in names (not referenced):
- "white petrol star.png"
- "grey face petrol star.png"
- "white face white star.png"

**Recommendation**: Clean up or rename

---

## Deployment Status

### Feature Branches Ready to Merge:
1. `claude/fix-dashboard-button-layout-011CUKhw3KqCPWBgXshsoH12`
   - VSL video update
   - Ask True North button fixes
   - Forgot password link
   - Security fixes
   - SEO improvements

### To Deploy:
```bash
git checkout main
git merge origin/claude/fix-dashboard-button-layout-011CUKhw3KqCPWBgXshsoH12
git push origin main
```

Vercel will auto-deploy.

---

## What Needs User Input

### 1. OpenAI API Key
**File**: `.env.local` (user needs to create)
```
OPENAI_API_KEY=sk-your-key-here
```

### 2. Knowledge Base Content
**File**: `lib/mason-knowledge-base.ts`

User needs to replace placeholder text with:
- Core philosophy
- Background and training
- Common themes (anger, relationships, purpose)
- Voice and communication style
- Specific quotes and phrases
- Approach to common questions

### 3. Admin Login Issue
User mentioned they can't login. Options:
1. Access Railway database to reset password
2. What email should work for admin account?

---

## Testing Checklist (After Deployment)

- [ ] Video playback (login → /journey → click video → YouTube plays)
- [ ] Comments (write comment → appears → refresh → still there)
- [ ] Likes (click heart → turns red → count increases → unlike works)
- [ ] Access control (logout → can't access /journey → login → can access)
- [ ] Admin access (regular member can't access /admin, admin can)
- [ ] Chrome login (should redirect without getting stuck)
- [ ] AI widget (ask question → get personalized answer)

---

## Database Schema

**Current Tables** (from `prisma/schema.prisma`):
- `users` - User accounts, authentication
- `videos` - Video content storage
- `comments` - Video comments
- `reactions` - Like/engagement tracking
- `activities` - Activity logs

**Potential Addition** (if implementing session archiving):
```prisma
model ZoomSession {
  id            String   @id @default(cuid())
  meetingId     String   @unique
  title         String
  userId        String
  startTime     DateTime
  duration      Int
  status        String   // active, archived, cancelled
  joinUrl       String
  recordingUrl  String?
  participants  Int?
  createdAt     DateTime @default(now())
  archivedAt    DateTime?

  @@map("zoom_sessions")
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with bcrypt + JWT
- `POST /api/auth/register` - User registration
- `POST /api/auth/reset-password` - Password reset (may be incomplete)

### Zoom Integration
- `POST /api/zoom/meetings` - Create Zoom meeting
  - Input: title, startTime, duration
  - Output: meetingId, joinUrl, password
  - **NOTE**: Currently doesn't save/archive meetings

### AI Integration
- `POST /api/ask-di` - Ask True North widget
  - Uses OpenAI GPT-4
  - Based on knowledge base content
  - 3 question limit per session

---

## Environment Variables

### Required
```
DATABASE_URL or DATABASE_PUBLIC_URL  # PostgreSQL connection
```

### Optional (for features)
```
OPENAI_API_KEY                       # For AI widget
ZOOM_ACCOUNT_ID                      # For Zoom integration
ZOOM_CLIENT_ID
ZOOM_CLIENT_SECRET
FIREBASE_SERVICE_ACCOUNT_JSON        # Firebase (initialized but unused)
FIREBASE_PROJECT_ID
```

---

## Git Workflow

### Current Branch
`claude/retrieve-archived-session-info-011CUSFzeWzQed3zuTZn9FHe`

### Main Branch
Auto-deploys to Vercel when pushed

### Previous Work Branch
`claude/fix-dashboard-button-layout-011CUKhw3KqCPWBgXshsoH12` (ready to merge)

### Git Push Requirements
- Always use `git push -u origin <branch-name>`
- Branch MUST start with `claude/` and end with session ID
- If network fails, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

---

## Code Quality Notes

### What's Working Well
- API route structure well organized
- Clean component separation
- Proper password security
- Parameterized database queries
- Cookie security properly configured
- Responsive design framework throughout

### Areas for Improvement
- 59 console statements found (mostly console.error for debugging)
- Some console.log statements should be removed for production
- Consider adding error boundary components
- Review hardcoded pixel widths for mobile

---

## Recommendations for Next Steps

### High Priority
1. Test login/logout flow
2. Fix duplicate navigation bars (architectural decision)
3. Add route groups for auth vs public pages
4. Fill knowledge base with user's content
5. Add OpenAI API key for AI widget

### Medium Priority
1. Remove console.log statements in production builds
2. Add error boundary components
3. Test/complete reset password flow
4. Review hardcoded pixel widths

### Low Priority
1. Clean up unused image assets
2. Add loading skeletons
3. Add page-specific meta tags
4. Consider implementing Zoom session archiving

---

## What's Left (Not Built)

User decisions or nice-to-have features:
- Payment/subscription integration (Stripe)
- Email notifications
- Real database for comments/likes (currently localStorage)
- Member profile pages
- Video progress tracking
- Search functionality
- Zoom session archiving

---

## Quick Reference - Key File Paths

| File | Purpose | Line Reference |
|------|---------|----------------|
| `/app/layout.tsx` | Root layout, metadata, navigation | - |
| `/app/auth/login/page.tsx` | Secure login page | - |
| `/app/api/auth/login/route.js` | Login API with bcrypt | - |
| `/app/journey/page.tsx` | Video library with YouTube embeds | - |
| `/app/library/page.tsx` | AI widget frontend | - |
| `/app/api/ask-di/route.ts` | OpenAI integration | - |
| `/app/api/zoom/meetings/route.ts` | Zoom meeting creation | - |
| `/lib/mason-knowledge-base.ts` | AI knowledge base | Needs user content |
| `/prisma/schema.prisma` | Database schema | - |

---

## Summary Statistics

- **Files Reviewed**: 50+
- **Lines of Code Analyzed**: 5000+
- **Security Issues Fixed**: 1 critical
- **Features Built**: 5 major
- **API Routes**: 17 total
- **Pages**: 15+ (mix of public and protected)
- **Commits Made**: Multiple on feature branch

---

## Questions for User (Outstanding)

1. Can you access Railway database to reset admin password?
2. Should duplicate navigation bars be fixed? If yes, which approach?
3. Do you want to implement Zoom session archiving?
4. Should reset password flow be completed or removed?
5. When will you add OpenAI API key and fill knowledge base?

---

## Final Status

**Ready for Deployment**: All features built and committed to feature branch
**Security**: Critical issues resolved
**SEO/Mobile**: Enhanced and improved
**User Action Required**: Merge to main, add API keys, fill knowledge base

---

**All work is committed and ready. The site is more secure, feature-rich, and optimized.**

Generated: October 24, 2025
Previous Session: 011CUKhw3KqCPWBgXshsoH12
Current Branch: claude/retrieve-archived-session-info-011CUSFzeWzQed3zuTZn9FHe
