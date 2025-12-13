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

    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      await client.end()
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      await client.end()
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existingUser.rows.length > 0) {
      await client.end()
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    const result = await client.query(
      `INSERT INTO users (name, email, password, role, "createdAt")
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, name, email, role, "createdAt"`,
      [name, email.toLowerCase(), hashedPassword, 'member']
    )

    await client.end()

    const user = result.rows[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: 'Seeker',
        daysUntilNext: 30,
        nextLevel: 'Explorer',
        joinDate: user.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    try { await client.end() } catch {}
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
