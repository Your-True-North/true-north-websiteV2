# Run Member Creation Script

## Quick Start - 3 Simple Steps

### Step 1: Create .env file
```bash
cp env.create-member.template .env
```

Then edit `.env` and add your actual credentials:
- DATABASE_URL: Your PostgreSQL connection string
- RESEND_API_KEY: Your Resend API key

### Step 2: Run the script
```bash
node create-member-alex.js
```

### Step 3: Check the output
The script will display:
```
=== Creating Member Account ===
Name: Alex Antoniou
Email: alexantoniou29@gmail.com

✓ Generated secure password (12 characters)
✓ Password hashed with bcrypt
✓ User created in database (ID: xxx)
✓ Welcome email sent (ID: xxx)

=== SUMMARY ===
User Created: YES
Email Sent: YES

Login Credentials:
Email: alexantoniou29@gmail.com
Password: [generated password]
Login URL: https://yourtruenorth.me/auth/login
```

---

## What This Script Does

1. **Generates Password**: Creates a secure 12-character password (letters + numbers)
2. **Hashes Password**: Uses bcrypt with 10 rounds
3. **Creates User**: Inserts into PostgreSQL database with:
   - Email: alexantoniou29@gmail.com
   - Name: Alex Antoniou
   - Role: member
   - Level: founding
   - Status: active
4. **Sends Email**: Via Resend from cor@thecor.yourtruenorth.me containing:
   - Welcome message
   - Login URL
   - Email and password

---

## Troubleshooting

### Error: "DATABASE_URL environment variable is required"
- Make sure you created the `.env` file
- Make sure you added your actual DATABASE_URL value
- The .env file should be in the project root directory

### Error: "RESEND_API_KEY environment variable is required"
- Make sure you added your RESEND_API_KEY to the `.env` file
- Get your key from: https://resend.com/api-keys

### Error: "connect ECONNREFUSED"
- Check that your DATABASE_URL is correct
- Make sure your database is accessible from this machine
- Check if you need to whitelist your IP address

### Email not received
- Check spam folder
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for email status
- Verify sending domain (cor@thecor.yourtruenorth.me) is configured

---

## Alternative: Use API Endpoint

If you prefer, you can use the API endpoint after deploying:

```bash
curl -X POST https://yourtruenorth.me/api/admin/create-member \
  -H "Content-Type: application/json" \
  -d '{"email":"alexantoniou29@gmail.com","name":"Alex Antoniou"}'
```

---

## Files

- `create-member-alex.js` - Main script
- `env.create-member.template` - Template for environment variables
- `RUN_CREATE_MEMBER.md` - This file (quick start guide)
- `CREATE_MEMBER_INSTRUCTIONS.md` - Detailed instructions with manual options
