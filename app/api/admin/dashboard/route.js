import { NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg

export async function GET(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()

    // Get total counts
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM videos WHERE status = 'active') as total_videos,
        (SELECT COUNT(*) FROM users WHERE role = 'member') as total_members,
        (SELECT COUNT(*) FROM comments) as total_comments,
        (SELECT COUNT(*) FROM reactions) as total_reactions
    `)

    // Get videos uploaded this month
    const thisMonth = await client.query(`
      SELECT COUNT(*) as videos_this_month
      FROM videos
      WHERE "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)
    `)

    // Get top engaged members (most comments + reactions)
    const topMembers = await client.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.level,
        u."createdAt" as joindate,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT r.id) as reaction_count,
        (COUNT(DISTINCT c.id) + COUNT(DISTINCT r.id)) as total_engagement
      FROM users u
      LEFT JOIN comments c ON u.id = c.user_id
      LEFT JOIN reactions r ON u.id = r.user_id
      WHERE u.role IS NULL OR u.role != 'admin'
      GROUP BY u.id, u.name, u.email, u.level, u."createdAt"
      ORDER BY total_engagement DESC
      LIMIT 10
    `)

    // Get recent activity (last 20 events)
    const recentActivity = await client.query(`
      SELECT
        a.type,
        a.title,
        a.description,
        a."createdAt",
        u.name as user_name,
        u.email as user_email,
        v.title as video_title
      FROM activities a
      LEFT JOIN users u ON a."userId" = u.id
      LEFT JOIN videos v ON a."videoId" = v.id
      ORDER BY a."createdAt" DESC
      LIMIT 20
    `)

    // Get most engaged videos (most comments + reactions)
    const topVideos = await client.query(`
      SELECT
        v.id,
        v.title,
        v.category,
        v."createdAt",
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT r.id) as reaction_count,
        (COUNT(DISTINCT c.id) + COUNT(DISTINCT r.id)) as total_engagement
      FROM videos v
      LEFT JOIN comments c ON v.id = c.video_id
      LEFT JOIN reactions r ON v.id = r.video_id
      WHERE v.status = 'active'
      GROUP BY v.id, v.title, v.category, v."createdAt"
      ORDER BY total_engagement DESC
      LIMIT 5
    `)

    await client.end()

    return NextResponse.json({
      stats: {
        totalVideos: parseInt(stats.rows[0].total_videos),
        totalMembers: parseInt(stats.rows[0].total_members),
        totalComments: parseInt(stats.rows[0].total_comments),
        totalReactions: parseInt(stats.rows[0].total_reactions),
        videosThisMonth: parseInt(thisMonth.rows[0].videos_this_month)
      },
      topMembers: topMembers.rows,
      recentActivity: recentActivity.rows,
      topVideos: topVideos.rows
    })

  } catch (error) {
    try { await client.end() } catch {}
    console.error('[Admin Dashboard] Error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data', details: error.message }, { status: 500 })
  }
}
