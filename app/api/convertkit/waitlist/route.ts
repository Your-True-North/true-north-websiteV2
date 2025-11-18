import { NextRequest, NextResponse } from 'next/server'

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CONVERTKIT_API_URL = 'https://api.convertkit.com/v3'
const WAITLIST_TAG_ID = '10466972'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!CONVERTKIT_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // First, add as subscriber (creates them if they don't exist)
    const subscriberResponse = await fetch(`${CONVERTKIT_API_URL}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: CONVERTKIT_API_KEY,
        email: email
      })
    })

    if (!subscriberResponse.ok) {
      const errorText = await subscriberResponse.text()
      console.error('[Waitlist] Subscriber creation failed:', errorText)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    // Then tag with waitlist
    const tagResponse = await fetch(`${CONVERTKIT_API_URL}/tags/${WAITLIST_TAG_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: CONVERTKIT_API_KEY,
        email: email
      })
    })

    if (!tagResponse.ok) {
      console.error('[Waitlist] Tagging failed')
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined Circle waitlist'
    })

  } catch (error) {
    console.error('[ConvertKit Waitlist] Error:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}
