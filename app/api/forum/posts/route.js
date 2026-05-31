import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendEmail } from '@/lib/email'

function firstName(name) {
  return (name || 'A member').split(' ')[0]
}

function postEmailHtml({ name, category, snippet, unsubId, postId }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;padding:2.5rem 1.5rem">
  <div style="text-align:center;margin-bottom:2rem">
    <img src="https://yourtruenorth.me/kyn-stacked-white.png" alt="KYN" style="height:60px">
  </div>
  <div style="background:#1a1a18;border:1px solid #2c2c2a;border-radius:8px;padding:2rem">
    <p style="color:#9bc4b8;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 0.75rem">${category}</p>
    <p style="color:#f0ede8;font-size:1.0625rem;font-weight:600;margin:0 0 1rem;line-height:1.4">${firstName(name)} posted in the community</p>
    <p style="color:#a0a09c;font-size:0.9375rem;line-height:1.65;margin:0 0 1.5rem;border-left:3px solid #333;padding-left:1rem;font-style:italic">${snippet}</p>
    <a href="https://yourtruenorth.me/community" style="display:inline-block;padding:0.75rem 1.5rem;background:#9bc4b8;color:#0a0a0a;text-decoration:none;border-radius:4px;font-weight:700;font-size:0.875rem">View Post</a>
  </div>
  <p style="text-align:center;color:#444;font-size:11px;margin-top:1.5rem;line-height:1.8">
    You're receiving this as a member of Know Your North.<br>
    <a href="https://yourtruenorth.me/api/notifications/unsubscribe?userId=${unsubId}&postId=${postId}" style="color:#666">Unsubscribe from this thread</a>
    &nbsp;&middot;&nbsp;
    <a href="https://yourtruenorth.me/api/notifications/unsubscribe?id=${unsubId}" style="color:#555">Stop all community emails</a>
  </p>
</div>
</body></html>`
}

async function notifyNewPost(postId, posterId, category, posterName, content) {
  try {
    const snippet = content.length > 220 ? content.slice(0, 220).trimEnd() + '...' : content
    let recipients
    try {
      const result = await query(
        `SELECT id, email, name FROM users
         WHERE id::text != $1
           AND email IS NOT NULL
           AND COALESCE(community_email_notifications, TRUE) = TRUE`,
        [String(posterId)]
      )
      recipients = result.rows
    } catch {
      // Column not yet migrated — notify everyone except poster
      const result = await query(
        `SELECT id, email, name FROM users WHERE id::text != $1 AND email IS NOT NULL`,
        [String(posterId)]
      )
      recipients = result.rows
    }

    await Promise.allSettled(recipients.map(u =>
      sendEmail({
        to: u.email,
        subject: `${firstName(posterName)} posted in ${category} — Know Your North`,
        html: postEmailHtml({ name: posterName, category, snippet, unsubId: u.id, postId }),
      })
    ))
  } catch (err) {
    console.error('[Post Notifications] Error:', err)
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Build query with JOINs for user names, reply counts, and like counts
    let sql = `
      SELECT
        cp.*,
        u.name as user_name,
        u.profile_photo as user_photo,
        COUNT(DISTINCT pr.id) as reply_count,
        COUNT(DISTINCT pl.id) as like_count
      FROM community_posts cp
      LEFT JOIN users u ON cp."userId"::text = u.id::text
      LEFT JOIN post_replies pr ON cp.id = pr.post_id
      LEFT JOIN post_likes pl ON cp.id = pl.post_id
    `
    const params = []

    if (category && category !== 'All Posts') {
      sql += ' WHERE cp.category = $1'
      params.push(category)
    }

    sql += ' GROUP BY cp.id, u.name, u.profile_photo'
    sql += ' ORDER BY cp.id DESC'

    let postsRows
    try {
      const result = await query(sql, params)
      postsRows = result.rows
    } catch (joinError) {
      // Fallback: simpler query without joins if tables are missing
      console.warn('[Forum Posts] JOIN query failed, using fallback:', joinError.message)
      let fallbackSql = 'SELECT * FROM community_posts'
      const fallbackParams = []
      if (category && category !== 'All Posts') {
        fallbackSql += ' WHERE category = $1'
        fallbackParams.push(category)
      }
      fallbackSql += ' ORDER BY id DESC'
      const result = await query(fallbackSql, fallbackParams)
      postsRows = result.rows
    }

    // Normalize field names for client
    const posts = postsRows.map(post => ({
      id: post.id,
      userId: post.userId || post.user_id,
      category: post.category,
      title: post.title,
      content: post.content,
      created_at: post.created_at || post.createdat,
      user_name: post.user_name || 'Member',
      user_photo: post.user_photo || null,
      reply_count: parseInt(post.reply_count) || 0,
      like_count: parseInt(post.like_count) || 0
    }))

    // Fetch all replies for all posts in one query
    const postIds = posts.map(p => p.id)
    let repliesByPost = {}
    if (postIds.length > 0) {
      try {
        const repliesResult = await query(
          `SELECT pr.id, pr.post_id, pr."userId", pr.content, pr.created_at, pr.parent_reply_id,
                  u.name as user_name, u.profile_photo as user_photo
           FROM post_replies pr
           LEFT JOIN users u ON pr."userId"::text = u.id::text
           WHERE pr.post_id = ANY($1::int[])
           ORDER BY pr.created_at ASC`,
          [postIds]
        )
        repliesResult.rows.forEach(r => {
          if (!repliesByPost[r.post_id]) repliesByPost[r.post_id] = []
          repliesByPost[r.post_id].push({
            id: r.id,
            content: r.content,
            created_at: r.created_at,
            parent_reply_id: r.parent_reply_id || null,
            user_name: r.user_name || 'Member',
            user_photo: r.user_photo || null,
          })
        })
      } catch (e) {
        console.warn('[Forum Posts] Could not fetch replies:', e.message)
      }
    }

    const postsWithReplies = posts.map(p => ({
      ...p,
      replies: repliesByPost[p.id] || []
    }))

    return NextResponse.json({ posts: postsWithReplies }, { status: 200 })
  } catch (error) {
    console.error('[Forum Posts GET] Error:', error)
    return NextResponse.json({
      error: 'Database error',
      details: error.message,
      posts: []
    }, { status: 200 })
  }
}

export async function POST(request) {
  try {
    const { userId, category, title, content } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!content || content.length < 10) {
      return NextResponse.json({ error: 'Content required (min 10 chars)' }, { status: 400 })
    }

    // Try with "userId" column name first, fall back to user_id
    let result
    try {
      result = await query(
        `INSERT INTO community_posts ("userId", category, title, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, category || null, title || null, content]
      )
    } catch (e) {
      result = await query(
        `INSERT INTO community_posts (user_id, category, title, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, category || null, title || null, content]
      )
    }

    const post = result.rows[0]

    // Fetch poster's name then fire emails (non-blocking)
    query('SELECT name FROM users WHERE id::text = $1', [String(userId)])
      .then(r => {
        const posterName = r.rows[0]?.name || 'A member'
        return notifyNewPost(post.id, userId, category || 'General', posterName, content)
      })
      .catch(err => console.error('[Post Notifications] Error:', err))

    return NextResponse.json({ post, message: 'Post created' }, { status: 201 })
  } catch (error) {
    console.error('[Forum Post CREATE] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
