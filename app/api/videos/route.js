// app/api/videos/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { videoService } from '../../../../lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let videos
    if (category && category !== 'all') {
      videos = await videoService.getVideosByCategory(category)
    } else {
      videos = await videoService.getAllVideos()
    }

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Check authentication and admin role
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-secret-key')
    
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const videoData = await request.json()
    
    // Validate required fields
    if (!videoData.title || !videoData.youtubeUrl || !videoData.category) {
      return NextResponse.json(
        { error: 'Title, YouTube URL, and category are required' },
        { status: 400 }
      )
    }

    const video = await videoService.createVideo(videoData)
    return NextResponse.json({ success: true, video })

  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}