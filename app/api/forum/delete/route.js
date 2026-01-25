import { NextResponse } from 'next/server'
import { Client } from 'pg'

const FALLBACK_DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

export async function DELETE(request) {
  try {
    const { id, type, userEmail } = await request.json()

    // Admin check
    if (userEmail !== 'navigate@yourtruenorth.me') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL || FALLBACK_DATABASE_URL
    })
    
    await client.connect()
    
    // Delete from appropriate table
    if (type === 'post') {
      await client.query('DELETE FROM community_posts WHERE id = $1', [id])
    } else if (type === 'reply') {
      await client.query('DELETE FROM post_replies WHERE id = $1', [id])
    }
    
    await client.end()
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('[Delete] Error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
