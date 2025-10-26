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

    const body = await request.json()
    const { userId, name, email, password, photo } = body

    if (!userId || !name || !email) {
      await client.end()
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email is already taken by another user
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    )

    if (emailCheck.rows.length > 0) {
      await client.end()
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    // Build update query
    let updateQuery = 'UPDATE users SET name = $1, email = $2'
    let params = [name, email]
    let paramIndex = 3

    // Add password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateQuery += `, password = $${paramIndex}`
      params.push(hashedPassword)
      paramIndex++
    }

    // Add photo if provided
    if (photo) {
      updateQuery += `, photo = $${paramIndex}`
      params.push(photo)
      paramIndex++
    }

    updateQuery += ` WHERE id = $${paramIndex} RETURNING id, name, email, role`
    params.push(userId)

    const result = await client.query(updateQuery, params)
    const updatedUser = result.rows[0]

    await client.end()

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    }, { status: 200 })

  } catch (error) {
    console.error('[Update Profile] Error:', error)
    try { await client.end() } catch {}
    return NextResponse.json({
      error: 'Failed to update profile',
      details: error.message
    }, { status: 500 })
  }
}
