import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendEmail } from '@/lib/email'

function firstName(name) {
  return (name || 'A member').split(' ')[0]
}

function replyEmailHtml({ replierName, category, snippet, unsubId, postId }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;padding:2.5rem 1.5rem">
  <div style="text-align:center;margin-bottom:2rem">
    <img src="https://yourtruenorth.me/kyn-stacked-white.png" alt="KYN" style="height:60px">
  </div>
  <div style="background:#1a1a18;border:1px solid #2c2c2a;border-radius:8px;padding:2rem">
    <p style="color:#9bc4b8;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 0.75rem">${category}</p>
    <p style="color:#f0ede8;font-size:1.0625rem;font-weight:600;margin:0 0 1rem;line-height:1.4">${firstName(replierName)} replied in the community</p>
    <p style="color:#a0a09c;font-size:0.9375rem;line-height:1.65;margin:0 0 1.5rem;border-left:3px solid #333;padding-left:1rem;font-style:italic">${snippet}</p>
    <a href="https://yourtruenorth.me/community" style="display:inline-block;padding:0.75rem 1.5rem;background:#9bc4b8;color:#0a0a0a;text-decoration:none;border-radius:4px;font-weight:700;font-size:0.875rem">View Thread</a>
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

async function notifyNewReply(postId, replierId, replierName, content) {
  try {
    const snippet = content.length > 220 ? content.slice(0, 220).trimEnd() + '...' : content

    // Get post author + category
    const postResult = await query(
      `SELECT cp."userId", cp.category, u.name as poster_name
       FROM community_posts cp
       LEFT JOIN users u ON cp."userId"::text = u.id::text
       WHERE cp.id = $1`,
      [postId]
    )
    if (!postResult.rows.length) return
    const { userId: postAuthorId, category } = postResult.rows[0]

    // Get all unique repliers on this post (excluding current replier)
    const repliersResult = await query(
      `SELECT DISTINCT "userId" FROM post_replies
       WHERE post_id = $1 AND "userId"::text != $2`,
      [postId, String(replierId)]
    )
    const replierIds = repliersResult.rows.map(r => String(r.userId))

    // Combine post author + previous repliers, deduplicate, exclude current replier
    const toNotifyIds = [...new Set([
      String(postAuthorId),
      ...replierIds
    ])].filter(id => id !== String(replierId))

    if (!toNotifyIds.length) return

    // Get emails for opted-in users who haven't muted this thread
    let recipients
    try {
      const result = await query(
        `SELECT id, email FROM users
         WHERE id::text = ANY($1)
           AND email IS NOT NULL
           AND COALESCE(community_email_notifications, TRUE) = TRUE
           AND id::text NOT IN (
             SELECT user_id FROM muted_post_notifications WHERE post_id = $2
           )`,
        [toNotifyIds, postId]
      )
      recipients = result.rows
    } catch {
      const result = await query(
        `SELECT id, email FROM users WHERE id::text = ANY($1) AND email IS NOT NULL`,
        [toNotifyIds]
      )
      recipients = result.rows
    }

    await Promise.allSettled(recipients.map(u =>
      sendEmail({
        to: u.email,
        subject: `${firstName(replierName)} replied in ${category || 'the community'} — Know Your North`,
        html: replyEmailHtml({ replierName, category: category || 'Community', snippet, unsubId: u.id, postId }),
      })
    ))
  } catch (err) {
    console.error('[Reply Notifications] Error:', err)
  }
}

export async function POST(request, props) {
  try {
    const params = await props.params
    const postId = params.id
    const { userId, content, parent_reply_id } = await request.json()

    // Validate
    if (!userId || !content || content.length < 1) {
      return NextResponse.json(
        { error: 'User ID and content required' },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Content too long (max 5000 chars)' },
        { status: 400 }
      )
    }

    // Insert reply - try with parent_reply_id first, fall back without it
    let result
    try {
      result = await query(
        `INSERT INTO post_replies (post_id, "userId", content, parent_reply_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [postId, userId, content, parent_reply_id || null]
      )
    } catch (insertError) {
      // parent_reply_id column may not exist - retry without it
      console.warn('[Forum Reply] Retrying without parent_reply_id:', insertError.message)
      result = await query(
        `INSERT INTO post_replies (post_id, "userId", content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [postId, userId, content]
      )
    }

    // Normalize the reply response for the client
    const reply = result.rows[0]
    const mappedReply = {
      ...reply,
      created_at: reply.created_at || reply.createdat,
      parent_reply_id: reply.parent_reply_id || null
    }

    // Fetch replier's name then fire emails (non-blocking)
    query('SELECT name FROM users WHERE id::text = $1', [String(userId)])
      .then(r => {
        const replierName = r.rows[0]?.name || 'A member'
        return notifyNewReply(postId, userId, replierName, content)
      })
      .catch(err => console.error('[Reply Notifications] Error:', err))

    return NextResponse.json(
      { reply: mappedReply, message: 'Reply posted successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Forum Reply] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
