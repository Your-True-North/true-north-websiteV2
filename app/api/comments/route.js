import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { commentService } from '../../lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    const comments = await commentService.getComments(videoId)
    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { videoId, content, token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET)
    const comment = await commentService.createComment(videoId, decoded.userId, content)
    
    return NextResponse.json({ comment })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
