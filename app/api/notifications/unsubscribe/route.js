import { query } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('id')

  if (!userId) {
    return new Response(page('Invalid link.', false), { headers: { 'Content-Type': 'text/html' } })
  }

  try {
    await query(
      'UPDATE users SET community_email_notifications = FALSE WHERE id::text = $1',
      [userId]
    )
    return new Response(page("You've been unsubscribed.", true), { headers: { 'Content-Type': 'text/html' } })
  } catch (error) {
    return new Response(page('Something went wrong. Please try again.', false), { headers: { 'Content-Type': 'text/html' } })
  }
}

function page(message, success) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Email Preferences</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:4rem auto;padding:2rem;text-align:center;color:#1a1a18;background:#fff">
  <img src="https://yourtruenorth.me/kyn-stacked-black.png" alt="KYN" style="height:72px;margin-bottom:2rem">
  <h2 style="margin:0 0 1rem;font-size:1.25rem">${message}</h2>
  ${success
    ? `<p style="color:#666;line-height:1.6;margin-bottom:2rem">You will no longer receive community email notifications. You can re-enable them at any time from the community settings.</p>`
    : `<p style="color:#666;line-height:1.6;margin-bottom:2rem">Please try again or update your preferences from the community page.</p>`
  }
  <a href="https://yourtruenorth.me/community" style="display:inline-block;padding:0.75rem 1.5rem;background:#9bc4b8;color:#0a0a0a;text-decoration:none;border-radius:4px;font-weight:700;font-size:0.875rem">Return to Community</a>
</body></html>`
}
