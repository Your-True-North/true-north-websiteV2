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
