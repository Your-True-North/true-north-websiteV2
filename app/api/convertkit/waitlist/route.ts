import { NextRequest, NextResponse } from 'next/server'

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CONVERTKIT_API_URL = 'https://api.convertkit.com/v3'
const WAITLIST_TAG_ID = '10466972'
const WAITLIST_SEQUENCE_ID = '1234567'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!CONVERTKIT_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const tagResponse = await fetch(`${CONVERTKIT_API_URL}/tags/${WAITLIST_TAG_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: CONVERTKIT_API_KEY,
        email: email
      })
    })

    if (!tagResponse.ok) {
      const errorText = await tagResponse.text()
      console.error('[Waitlist] Tagging failed:', errorText)
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    // Add to sequence
    await fetch(`${CONVERTKIT_API_URL}/sequences/${WAITLIST_SEQUENCE_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: CONVERTKIT_API_KEY,
        email: email
      })
    }).catch((err) => console.error('[Waitlist] Sequence subscription failed:', err))

    return NextResponse.json({
      success: true,
      message: 'Successfully joined Circle waitlist'
    })

  } catch (error) {
    console.error('[ConvertKit Waitlist] Error:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}
