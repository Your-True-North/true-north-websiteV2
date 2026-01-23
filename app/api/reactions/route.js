// app/api/reactions/route.js
import { NextResponse } from 'next/server'
import { Client } from 'pg'

// POST: Toggle video like/reaction
export async function POST(request) {
  const client = new Client({ connectionString: process.env.DATABASE_URL })

  try {
    await client.connect()

    // Get user ID from request body (sent by frontend)
    const { videoId, userId } = await request.json()

    if (!videoId || !userId) {
      return NextResponse.json(
        { error: 'Video ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if reaction already exists
    const checkQuery = `
      SELECT id FROM video_reactions
      WHERE video_id = $1 AND user_id = $2
    `
    const existing = await client.query(checkQuery, [videoId, userId])

    if (existing.rows.length > 0) {
      // Unlike: Remove the reaction
      const deleteQuery = `DELETE FROM video_reactions WHERE video_id = $1 AND user_id = $2`
      await client.query(deleteQuery, [videoId, userId])
      return NextResponse.json({ success: true, liked: false })
    } else {
      // Like: Add the reaction
      const insertQuery = `
        INSERT INTO video_reactions (video_id, user_id, reaction_type, created_at)
        VALUES ($1, $2, 'like', NOW())
      `
      await client.query(insertQuery, [videoId, userId])
      return NextResponse.json({ success: true, liked: true })
    }

  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json(
      { error: 'Failed to toggle reaction: ' + error.message },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}

// GET: Fetch user's video likes
export async function GET(request) {
  const client = new Client({ connectionString: process.env.DATABASE_URL })

  try {
    await client.connect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get all video IDs that this user has liked
    const query = `
      SELECT video_id FROM video_reactions
      WHERE user_id = $1
    `
    const result = await client.query(query, [userId])

    // Return as an object with video IDs as keys (for easy lookup)
    const likes = {}
    result.rows.forEach(row => {
      likes[row.video_id] = true
    })

    return NextResponse.json({ success: true, likes })

  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reactions: ' + error.message },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}