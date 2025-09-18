// app/api/reactions/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { reactionService } from '../../../../lib/database'

export async function POST(request) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-secret-key')
    
    const reactionData = await request.json()
    reactionData.userId = decoded.userId

    // Validate required fields
    if (!reactionData.type || !reactionData.videoId) {
      return NextResponse.json(
        { error: 'Reaction type and video ID are required' },
        { status: 400 }
      )
    }

    const result = await reactionService.toggleReaction(reactionData)
    return NextResponse.json({ success: true, ...result })

  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json(
      { error: 'Failed to toggle reaction' },
      { status: 500 }
    )
  }
}