import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendEmail } from '@/lib/email'

function firstName(name) {
  return (name || 'A member').split(' ')[0]
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== 'test-notifications') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await query(`
      SELECT cp.id, cp.content, cp.category, u.name as poster_name
      FROM community_posts cp
      LEFT JOIN users u ON cp."userId"::text = u.id::text
      ORDER BY cp.id DESC
      LIMIT 1
    `)

    if (!result.rows.length) {
      return NextResponse.json({ error: 'No posts found' }, { status: 404 })
    }

    const post = result.rows[0]
    const name = post.poster_name || 'A member'
    const category = post.category || 'Community'
    const snippet = post.content.length > 220
      ? post.content.slice(0, 220).trimEnd() + '...'
      : post.content

    const html = `<!DOCTYPE html>
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
    <a href="https://yourtruenorth.me/api/notifications/unsubscribe?userId=TEST&postId=${post.id}" style="color:#666">Unsubscribe from this thread</a>
    &nbsp;&middot;&nbsp;
    <a href="https://yourtruenorth.me/api/notifications/unsubscribe?id=TEST" style="color:#555">Stop all community emails</a>
  </p>
</div>
</body></html>`

    await sendEmail({
      to: 'navigate@yourtruenorth.me',
      subject: `[TEST] ${firstName(name)} posted in ${category} — Know Your North`,
      html,
    })

    return NextResponse.json({
      success: true,
      sentTo: 'navigate@yourtruenorth.me',
      post: { id: post.id, category, poster: name }
    })
  } catch (error) {
    console.error('[Test Notification] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
