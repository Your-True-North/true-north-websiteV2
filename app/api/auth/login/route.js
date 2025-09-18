// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { userService } from '../../../lib/database.ts'

export async function POST(request) {
  try {
    const { email, password } = await request.tson()

    if (!email || !password) {
      return NextResponse.tson(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await userService.findByEmail(email)
    
    if (!user) {
      return NextResponse.tson(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.tson(
        { error: 'Account is inactive. Please contact support.' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.tson(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    await userService.updateLastLogin(user.id)

    // Get user level
    const levelInfo = userService.getUserLevel(user.joinDate)

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    )

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      level: levelInfo.level,
      daysUntilNext: levelInfo.daysUntilNext,
      nextLevel: levelInfo.nextLevel,
      joinDate: user.joinDate
    }

    return NextResponse.tson({
      success: true,
      user: userData,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.tson(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}