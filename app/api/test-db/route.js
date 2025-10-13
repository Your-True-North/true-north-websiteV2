import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['Navigate@yourtruenorth.me'])
    
    return NextResponse.json({
      success: true,
      userExists: result.rows.length > 0,
      userData: result.rows[0] ? {
        email: result.rows[0].email,
        name: result.rows[0].name,
        role: result.rows[0].role,
        passwordHash: result.rows[0].password
      } : null
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
