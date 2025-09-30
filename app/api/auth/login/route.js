import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

const userService = {
  async findByEmail(email: string) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0] || null
  },

  async updateLastLogin(userId: number) {
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    )
  },

  getUserLevel(joinDate: Date) {
    const now = new Date()
    const daysSinceJoin = Math.floor((now.getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceJoin < 30) {
      return { level: 'Seeker', daysUntilNext: 30 - daysSinceJoin, nextLevel: 'Explorer' }
    } else if (daysSinceJoin < 90) {
      return { level: 'Explorer', daysUntilNext: 90 - daysSinceJoin, nextLevel: 'Pathfinder' }
    } else if (daysSinceJoin < 180) {
      return { level: 'Pathfinder', daysUntilNext: 180 - daysSinceJoin, nextLevel: 'Guide' }
    } else {
      return { level: 'Guide', daysUntilNext: 0, nextLevel: null }
    }
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await userService.findByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await userService.updateLastLogin(user.id)

    const levelInfo = userService.getUserLevel(user.join_date)

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
      joinDate: user.join_date
    }

    const response = NextResponse.json({
      success: true,
      user: userData,
      token
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}