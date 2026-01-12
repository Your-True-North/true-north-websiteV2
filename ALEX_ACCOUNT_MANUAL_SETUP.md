# Create Alex Antoniou's Account - Manual Setup

**⚠️ Network connectivity issue prevents automated execution. Use this manual guide instead.**

## Member Details
- **Name:** Alex Antoniou
- **Email:** alexantoniou29@gmail.com
- **Password:** `nwZHcBHFCUR4`
- **User ID:** cmkb6kmsaMVmejns370VJ
- **Role:** member
- **Level:** founding

---

## Option 1: Run SQL Directly (Fastest)

### Step 1: Execute this SQL in your Railway PostgreSQL database

```sql
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
  'cmkb6kmsaMVmejns370VJ',
  'alexantoniou29@gmail.com',
  'Alex Antoniou',
  '$2b$10$CDPC/c3QYPFQligqwHXZyeJ6.5MgXi.5mG2V1edKRirfV5smTXgd2',
  'member',
  'founding',
  true,
  NOW(),
  NOW(),
  NOW()
)
RETURNING id, email, name;
```

**How to run:**
1. Go to your Railway dashboard
2. Open your PostgreSQL database
3. Go to the "Query" tab
4. Paste the SQL above and execute it
5. You should see the new user returned

### Step 2: Send Welcome Email via Resend

**Option A: Use Resend Dashboard**
1. Go to https://resend.com/emails
2. Click "Send Email"
3. Fill in the details below

**Option B: Use Resend API**
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_52udxHHg_BdqD67Rn5xMaNT5dujCfY7kW' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "Circle of Return <cor@thecor.yourtruenorth.me>",
    "to": "alexantoniou29@gmail.com",
    "subject": "Welcome to Circle of Return",
    "html": "<html><head><style>body{font-family:Arial,sans-serif;padding:40px;background:#f5f5f5;}.container{max-width:600px;margin:0 auto;background:white;padding:40px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}h1{color:#9bc4b8;margin-bottom:20px;}.credentials{background:#f8f9fa;padding:20px;border-radius:6px;margin:25px 0;border-left:4px solid #9bc4b8;}.credential-item{margin:10px 0;font-family:monospace;}.label{font-weight:bold;color:#555;}.cta-button{display:inline-block;padding:12px 30px;background:#9bc4b8;color:white;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:bold;}.signature{margin-top:30px;color:#666;}</style></head><body><div class=\"container\"><h1>Welcome Alex!</h1><p>Your Circle of Return account is ready.</p><div class=\"credentials\"><div class=\"credential-item\"><span class=\"label\">Login:</span> <a href=\"https://yourtruenorth.me/auth/login\">https://yourtruenorth.me/auth/login</a></div><div class=\"credential-item\"><span class=\"label\">Email:</span> alexantoniou29@gmail.com</div><div class=\"credential-item\"><span class=\"label\">Password:</span> nwZHcBHFCUR4</div></div><a href=\"https://yourtruenorth.me/auth/login\" class=\"cta-button\">Log In Now</a><p class=\"signature\">See you inside,<br><strong>True</strong></p></div></body></html>"
  }'
```

**Email Details:**
- **From:** Circle of Return <cor@thecor.yourtruenorth.me>
- **To:** alexantoniou29@gmail.com
- **Subject:** Welcome to Circle of Return
- **Body:** (see template below)

---

## Email Template (Plain Text Version)

```
Welcome Alex!

Your Circle of Return account is ready.

Login: https://yourtruenorth.me/auth/login
Email: alexantoniou29@gmail.com
Password: nwZHcBHFCUR4

See you inside,
True
```

---

## Option 2: Run Script from Your Local Machine

If you have Node.js installed locally with network access to Railway:

```bash
# The .env file is already created with your credentials
node create-member-alex.js
```

This will automatically:
1. Create the user in the database
2. Send the welcome email
3. Display the credentials

---

## Option 3: Use API Endpoint (After Deployment)

Once the code is deployed to production:

```bash
curl -X POST https://yourtruenorth.me/api/admin/create-member \
  -H "Content-Type: application/json" \
  -d '{"email":"alexantoniou29@gmail.com","name":"Alex Antoniou"}'
```

---

## Login Credentials Summary

**USER CREATED:** Ready to create
**EMAIL TO SEND:** Ready to send

**Login URL:** https://yourtruenorth.me/auth/login
**Email:** alexantoniou29@gmail.com
**Password:** nwZHcBHFCUR4

---

## Security Notes

- Password is 12 characters (letters + numbers): `nwZHcBHFCUR4`
- Password is hashed with bcrypt (10 rounds)
- User level is set to "founding"
- User is active and can log in immediately

---

## Verification

After creating the account, verify by:
1. Logging in at https://yourtruenorth.me/auth/login
2. Using email: alexantoniou29@gmail.com
3. Using password: nwZHcBHFCUR4
4. Check that Alex received the welcome email

---

## Report Back When Complete

- [ ] User created in database
- [ ] Welcome email sent
- [ ] Login verified
