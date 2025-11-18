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
      console.error('[ConvertKit Waitlist] Missing CONVERTKIT_API_KEY')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Tag subscriber with Circle waitlist tag only
    const response = await fetch(`${CONVERTKIT_API_URL}/tags/${WAITLIST_TAG_ID}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: CONVERTKIT_API_KEY,
        email: email
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[ConvertKit Waitlist] Failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    const result = await response.json()
    console.log('[ConvertKit Waitlist] Success:', result)

    return NextResponse.json({
      success: true,
      message: 'Successfully joined Circle waitlist'
    })

  } catch (error) {
    console.error('[ConvertKit Waitlist] Error:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
