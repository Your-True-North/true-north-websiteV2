import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, firstName, tag, resource } = await request.json()
  
  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
  const CONVERTKIT_API_SECRET = process.env.CONVERTKIT_API_SECRET
  
  if (!CONVERTKIT_API_KEY || !CONVERTKIT_API_SECRET) {
    return NextResponse.json({ error: 'API keys not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: CONVERTKIT_API_KEY,
        email: email,
        first_name: firstName,
        tags: [tag || 'library-download', resource]
      }),
    })

    if (response.ok) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
