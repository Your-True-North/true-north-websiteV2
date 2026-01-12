# Create Theodoros' Account - Manual Setup

## Member Details
- **Name:** Theodoros
- **Email:** leadbyexample76@outlook.com
- **Password:** `xUHQFUnHwnV9`
- **User ID:** cmkb71rn5LhC8Uc5kySvd
- **Role:** member
- **Level:** founding

---

## Quick Setup - SQL + Email

### Step 1: Execute this SQL in Railway PostgreSQL

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
  'cmkb71rn5LhC8Uc5kySvd',
  'leadbyexample76@outlook.com',
  'Theodoros',
  '$2b$10$11bJEYyhEmCyAQsufooZietVWB7FD.PQ1C05Ye2sKMBcSDBl8MAJ6',
  'member',
  'founding',
  true,
  NOW(),
  NOW(),
  NOW()
)
RETURNING id, email, name;
```

### Step 2: Send Welcome Email

**Via Resend API:**
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_52udxHHg_BdqD67Rn5xMaNT5dujCfY7kW' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "Circle of Return <cor@thecor.yourtruenorth.me>",
    "to": "leadbyexample76@outlook.com",
    "subject": "Welcome to Circle of Return",
    "html": "<html><head><style>body{font-family:Arial,sans-serif;padding:40px;background:#f5f5f5;}.container{max-width:600px;margin:0 auto;background:white;padding:40px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}h1{color:#9bc4b8;margin-bottom:20px;}.credentials{background:#f8f9fa;padding:20px;border-radius:6px;margin:25px 0;border-left:4px solid #9bc4b8;}.credential-item{margin:10px 0;font-family:monospace;}.label{font-weight:bold;color:#555;}.cta-button{display:inline-block;padding:12px 30px;background:#9bc4b8;color:white;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:bold;}.signature{margin-top:30px;color:#666;}</style></head><body><div class=\"container\"><h1>Welcome Theodoros!</h1><p>Your Circle of Return account is ready.</p><div class=\"credentials\"><div class=\"credential-item\"><span class=\"label\">Login:</span> <a href=\"https://yourtruenorth.me/auth/login\">https://yourtruenorth.me/auth/login</a></div><div class=\"credential-item\"><span class=\"label\">Email:</span> leadbyexample76@outlook.com</div><div class=\"credential-item\"><span class=\"label\">Password:</span> xUHQFUnHwnV9</div></div><a href=\"https://yourtruenorth.me/auth/login\" class=\"cta-button\">Log In Now</a><p class=\"signature\">See you inside,<br><strong>True</strong></p></div></body></html>",
    "text": "Welcome Theodoros!\n\nYour Circle of Return account is ready.\n\nLogin: https://yourtruenorth.me/auth/login\nEmail: leadbyexample76@outlook.com\nPassword: xUHQFUnHwnV9\n\nSee you inside,\nTrue"
  }'
```

**Or via Resend Dashboard:**
- **From:** Circle of Return <cor@thecor.yourtruenorth.me>
- **To:** leadbyexample76@outlook.com
- **Subject:** Welcome to Circle of Return
- **Body:**

```
Welcome Theodoros!

Your Circle of Return account is ready.

Login: https://yourtruenorth.me/auth/login
Email: leadbyexample76@outlook.com
Password: xUHQFUnHwnV9

See you inside,
True
```

---

## Alternative: Run Node.js Script

If you have the .env file configured:

```bash
node create-member-theodoros.js
```

---

## Login Credentials Summary

**Email:** leadbyexample76@outlook.com
**Password:** `xUHQFUnHwnV9`
**Login URL:** https://yourtruenorth.me/auth/login

---

## Verification Checklist

- [ ] User created in database
- [ ] Welcome email sent
- [ ] Login verified at https://yourtruenorth.me/auth/login
