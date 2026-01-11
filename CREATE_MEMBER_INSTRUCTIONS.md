# Create Member Account for Alex Antoniou

## Member Details
- **Name:** Alex Antoniou
- **Email:** alexantoniou29@gmail.com
- **Level:** founding
- **Role:** member

## Option 1: Use the Node.js Script (Recommended)

### Prerequisites
Set the following environment variables:
```bash
export DATABASE_URL="your_postgres_connection_string"
export RESEND_API_KEY="your_resend_api_key"
```

### Run the Script
```bash
node create-member-alex.js
```

This will:
1. Generate a secure 12-character password
2. Hash it with bcrypt
3. Create the user in the database
4. Send the welcome email via Resend
5. Display the login credentials

---

## Option 2: Use the API Endpoint

I've created an API endpoint at `/api/admin/create-member`.

### Deploy and Call
```bash
# After deploying the changes
curl -X POST https://yourtruenorth.me/api/admin/create-member \
  -H "Content-Type: application/json" \
  -d '{"email":"alexantoniou29@gmail.com","name":"Alex Antoniou"}'
```

---

## Option 3: Manual SQL + Email (Fallback)

If you prefer to do it manually, here's what you need:

### Step 1: Generate Password and Hash
```javascript
// Run this in Node.js REPL or a script
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

// Generate password
const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
let password = ''
const randomBytes = crypto.randomBytes(12)
for (let i = 0; i < 12; i++) {
  password += charset[randomBytes[i] % charset.length]
}
console.log('Password:', password)

// Hash password
bcrypt.hash(password, 10).then(hash => console.log('Hash:', hash))
```

### Step 2: Insert into Database
```sql
-- Replace [hashedPassword] with the hash from above
-- Replace [userId] with a generated CUID (e.g., c1a2b3c4d5e6f7g8h9i0)

INSERT INTO users (
  id,
  email,
  name,
  password,
  role,
  level,
  "isActive",
  "joinDate",
  "createdAt",
  "updatedAt"
) VALUES (
  'c' || floor(random() * 1000000000)::text, -- Simple ID generation
  'alexantoniou29@gmail.com',
  'Alex Antoniou',
  '[hashedPassword]',
  'member',
  'founding',
  true,
  NOW(),
  NOW(),
  NOW()
)
RETURNING id, email, name;
```

### Step 3: Send Welcome Email via Resend

Use the Resend dashboard or API:

**To:** alexantoniou29@gmail.com
**From:** Circle of Return <cor@thecor.yourtruenorth.me>
**Subject:** Welcome to Circle of Return

**Body:**
```
Welcome Alex!

Your Circle of Return account is ready.

Login: https://yourtruenorth.me/auth/login
Email: alexantoniou29@gmail.com
Password: [the password from Step 1]

See you inside,
True
```

---

## Files Created

1. **create-member-alex.js** - Standalone Node.js script
2. **app/api/admin/create-member/route.js** - Next.js API endpoint
3. **CREATE_MEMBER_INSTRUCTIONS.md** - This file

---

## Security Notes

- The password is 12 characters with letters and numbers
- Password is hashed with bcrypt (10 rounds)
- User level is set to "founding"
- User is set as active by default

---

## Next Steps

Choose one of the options above and run it. The script/endpoint will output:
- User Created: YES/NO
- Email Sent: YES/NO
- Login credentials
