#!/bin/bash

mkdir -p app/admin-reset
cat > app/admin-reset/page.tsx << 'ADMIN_EOF'
'use client'
import { useState } from 'react'

export default function AdminReset() {
  const [newPassword, setNewPassword] = useState('')
  const [result, setResult] = useState('')

  const handleReset = async () => {
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'Navigate@yourtruenorth.me',
        newPassword 
      })
    })
    const data = await res.json()
    setResult(JSON.stringify(data, null, 2))
  }

  return (
    <div style={{ padding: '2rem', background: '#0a0a0b', minHeight: '100vh', color: '#fff' }}>
      <h1>Reset Navigate Password</h1>
      <input
        type="text"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        style={{ padding: '1rem', width: '300px', marginRight: '1rem' }}
      />
      <button onClick={handleReset} style={{ padding: '1rem 2rem', cursor: 'pointer' }}>
        Reset Password
      </button>
      {result && <pre style={{ marginTop: '2rem', background: '#222', padding: '1rem' }}>{result}</pre>}
    </div>
  )
}
ADMIN_EOF

mkdir -p app/api/admin/reset-password
cat > app/api/admin/reset-password/route.js << 'API_EOF'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pkg from 'pg'
const { Client } = pkg

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()
    const { email, newPassword } = await request.json()
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE LOWER(email) = LOWER($2) RETURNING email',
      [hashedPassword, email]
    )
    
    await client.end()
    
    if (result.rows.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: `Password updated for ${result.rows[0].email}`,
        newPassword: newPassword 
      })
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
  } catch (error) {
    try { await client.end() } catch {}
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
API_EOF

git add app/admin-reset app/api/admin
git commit -m "Add admin password reset tool"
git push origin main

echo ""
echo "✅ Deployed! After Vercel finishes deploying:"
echo "1. Go to: https://true-north-website-v2-cni8.vercel.app/admin-reset"
echo "2. Enter a new password (e.g., TrueNorth123!)"
echo "3. Click Reset Password"
echo "4. Use that password to login at /members"
