import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request) {
  const steps = []
  
  try {
    const body = await request.json()
    steps.push({ step: 'Body parsed', data: { email: body.email, hasPassword: !!body.password } })
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [body.email])
    steps.push({ step: 'Query executed', rows: result.rows.length })
    
    const user = result.rows[0]
    if (!user) {
      steps.push({ step: 'No user found' })
      return NextResponse.json({ steps })
    }
    
    steps.push({ step: 'User found', user: { email: user.email, hashStart: user.password.substring(0, 10) } })
    
    const isValid = await bcrypt.compare(body.password, user.password)
    steps.push({ step: 'Password compared', isValid })
    
    return NextResponse.json({ steps, success: isValid })
    
  } catch (error) {
    steps.push({ step: 'Error', error: error.message })
    return NextResponse.json({ steps })
  }
}
