// app/api/comments/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { commentService } from '../../../lib/database'

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
    
    const commentData = await request.json()
    commentData.userId = decoded.userId

    // Validate required fields
    if (!commentData.content || !commentData.videoId) {
      return NextResponse.json(
        { error: 'Content and video ID are required' },
        { status: 400 }
      )
    }

    const comment = await commentService.addComment(commentData)
    return NextResponse.json({ success: true, comment })

  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}