import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()
    
    const result = await client.query(
      'SELECT video_progress FROM users WHERE id = $1',
      [userId]
    )
    
    await client.end()
    
    const videoProgress = result.rows[0]?.video_progress || {}
    const videos = Object.values(videoProgress)
    
    const stats = {
      videosWatched: videos.filter((v: any) => v.completed).length,
      totalWatchTime: videos.reduce((sum: number, v: any) => sum + (v.watched_seconds || 0), 0),
      completionRate: videos.length > 0 
        ? Math.round((videos.filter((v: any) => v.completed).length / videos.length) * 100)
        : 0,
      continueWatching: Object.entries(videoProgress)
        .filter(([_, v]: [string, any]) => v.percentage >= 10 && v.percentage < 90)
        .sort(([_, a]: [string, any], [__, b]: [string, any]) => 
          new Date(b.last_watched).getTime() - new Date(a.last_watched).getTime()
        )
        .slice(0, 3)
        .map(([id, v]) => ({ id, ...v }))
    }
    
    return NextResponse.json({ stats })
    
  } catch (error) {
    console.error('[Stats] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
