# Email Setup Guide for Password Reset Feature

## Context
The True North website has a password reset feature that sends emails to users. It needs SMTP credentials configured to work.

## Current Status
- ✅ Password reset code is implemented and deployed
- ❌ Email configuration missing - needs .env.local file with SMTP credentials
- 📍 Project location: `truenorth-final` folder on user's Mac

## What Needs To Be Done

### Step 1: Create .env.local File
The user needs to create a file called `.env.local` in the root of their project folder.

**Terminal method:**
```bash
# Navigate to project (user is likely already there)
cd truenorth-final

# Create and edit file
nano .env.local
```

**VS Code method:**
```bash
# Open project in VS Code
code .

# Then create new file named: .env.local
```

### Step 2: Add Configuration
Paste this into the .env.local file:

```
# Database (if user has existing values, use those)
DATABASE_URL=
DATABASE_PUBLIC_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Stripe (if user has keys)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email Configuration - REQUIRED FOR PASSWORD RESET
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Circle of Return" <noreply@truenorthwithin.com>

# Site URL
NEXT_PUBLIC_APP_URL=https://truenorthwithin.com
```

### Step 3: Get Gmail App Password

**Guide user through:**

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with their Google account
3. Click "Select app" → Choose "Mail"
4. Click "Select device" → Choose "Other" → Type "True North Website"
5. Click "Generate"
6. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)
7. Paste into SMTP_PASS in .env.local (remove spaces: xxxxxxxxxxxxxxxx)

**Important:** This is NOT their regular Gmail password - it's a special app-specific password.

### Step 4: Fill in SMTP_USER
Ask user which Gmail address they want to send password reset emails from.
Put that in SMTP_USER field.

Example:
```
SMTP_USER=mason@truenorthwithin.com
SMTP_PASS=abcdwxyzabcdwxyz
```

### Step 5: Save the File

**If using nano:**
- Press Ctrl + X
- Press Y
- Press Enter

**If using VS Code:**
- Press Cmd + S

### Step 6: Add to Production Environment

The user also needs to add these same SMTP variables to their hosting platform (Vercel/Netlify/etc):

1. Go to hosting dashboard
2. Find Environment Variables or Settings
3. Add these variables:
   - SMTP_HOST = smtp.gmail.com
   - SMTP_PORT = 587
   - SMTP_USER = (their email)
   - SMTP_PASS = (their app password)
   - SMTP_FROM = "Circle of Return" <noreply@truenorthwithin.com>
   - NEXT_PUBLIC_APP_URL = https://truenorthwithin.com

4. Redeploy the site

### Step 7: Test
Once configured, users can test by:
1. Go to login page
2. Click "Forgot Password?"
3. Enter email address
4. Check inbox for password reset email

## Common Issues

**"App passwords not available"**
- User needs 2-factor authentication enabled on their Google account first
- Go to https://myaccount.google.com/security
- Enable 2-Step Verification
- Then try app passwords again

**"Email not sending"**
- Check SMTP_PASS has no spaces
- Verify SMTP_USER is correct email
- Check hosting environment variables match .env.local

**"Less secure app access"**
- Google removed this - must use App Passwords now
- Do NOT use regular Gmail password

## Alternative Email Services

If user wants professional email service instead of Gmail:

**Resend (Recommended)**
- Free: 3000 emails/month
- Setup: https://resend.com
- Change SMTP_HOST to: smtp.resend.com
- Use API key as SMTP_PASS

**SendGrid**
- Free: 100 emails/day
- Setup: https://sendgrid.com
- Change SMTP_HOST to: smtp.sendgrid.net
- Port: 587
- Use API key as SMTP_PASS

## Security Notes
- NEVER commit .env.local to git (it's in .gitignore)
- Keep app passwords secret
- Each environment (local, production) needs its own .env configuration
