import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    const { userId, name, email, photo, bio } = await request.json()

    // Verify user can only update their own profile
    if (user.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate inputs
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name is too long' },
        { status: 400 }
      )
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio is too long (max 500 characters)' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.trim().toLowerCase(), userId]
      )

      if (emailCheck.rows.length > 0) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
    }

    // Build update query dynamically
    const updates = []
    const values = []
    let paramCount = 1

    updates.push(`name = $${paramCount}`)
    values.push(name.trim())
    paramCount++

    if (email) {
      updates.push(`email = $${paramCount}`)
      values.push(email.trim().toLowerCase())
      paramCount++
    }

    if (photo) {
      updates.push(`profile_photo = $${paramCount}`)
      values.push(photo)
      paramCount++
    }

    if (bio !== undefined) {
      updates.push(`bio = $${paramCount}`)
      values.push(bio ? bio.trim() : null)
      paramCount++
    }

    values.push(userId)

    const updateQuery = `
      UPDATE users
      SET ${updates.join(', ')}, "updatedAt" = NOW()
      WHERE id = $${paramCount}
      RETURNING id, name, email, profile_photo, bio, level, role, "createdAt"
    `

    const result = await query(updateQuery, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedUser = result.rows[0]

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile_photo: updatedUser.profile_photo,
        bio: updatedUser.bio,
        level: updatedUser.level,
        role: updatedUser.role,
        joinDate: updatedUser.createdAt
      }
    })
  } catch (error) {
    console.error('[Update Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
