import { query } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || searchParams.get('id')
  const postId = searchParams.get('postId')

  if (!userId) {
    return new Response(page('Invalid unsubscribe link.', false), { headers: { 'Content-Type': 'text/html' } })
  }

  try {
    if (postId) {
      // Per-thread unsubscribe
      await query(
        `INSERT INTO muted_post_notifications (user_id, post_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [String(userId), parseInt(postId)]
      )
      return new Response(
        page("You've been unsubscribed from this thread.", true, true),
        { headers: { 'Content-Type': 'text/html' } }
      )
    } else {
      // Global unsubscribe
      await query(
        'UPDATE users SET community_email_notifications = FALSE WHERE id::text = $1',
        [String(userId)]
      )
      return new Response(
        page("You've been unsubscribed from all community emails.", true, false),
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
  } catch (error) {
    console.error('[Unsubscribe] Error:', error)
    return new Response(page('Something went wrong. Please try again.', false), { headers: { 'Content-Type': 'text/html' } })
  }
}

function page(message, success, isThread) {
  const detail = success
    ? isThread
      ? 'You will no longer receive email updates when someone replies to this post. Your other community notification settings are unchanged.'
      : 'You will no longer receive any community email notifications. You can re-enable them at any time from the community settings.'
    : 'Please try again or update your preferences from the community page.'

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Email Preferences — KYN</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:4rem auto;padding:2rem;text-align:center;color:#1a1a18;background:#fff">
  <img src="https://yourtruenorth.me/kyn-stacked-black.png" alt="KYN" style="height:72px;margin-bottom:2rem">
  <h2 style="margin:0 0 1rem;font-size:1.25rem;font-weight:600">${message}</h2>
  <p style="color:#666;line-height:1.65;margin-bottom:2rem;font-size:0.9375rem">${detail}</p>
  <a href="https://yourtruenorth.me/community" style="display:inline-block;padding:0.75rem 1.5rem;background:#9bc4b8;color:#0a0a0a;text-decoration:none;border-radius:4px;font-weight:700;font-size:0.875rem">Return to Community</a>
</body></html>`
}
