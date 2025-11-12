// app/api/convertkit/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server'

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CONVERTKIT_API_URL = 'https://api.convertkit.com/v3'
const CONVERTKIT_FORM_ID = process.env.THE_ECO_SYSTEM_ID
const WAITLIST_TAG_ID = process.env.THE_CoR_WAITLIST_TAG_ID

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

    if (!CONVERTKIT_FORM_ID) {
      console.error('[ConvertKit Waitlist] Missing THE_ECO_SYSTEM_ID environment variable')
      return NextResponse.json({ error: 'Server configuration error - missing form ID' }, { status: 500 })
    }

    console.log('[ConvertKit Waitlist] Environment check:', {
      hasApiKey: !!CONVERTKIT_API_KEY,
      hasFormId: !!CONVERTKIT_FORM_ID,
      hasTagId: !!WAITLIST_TAG_ID,
      formId: CONVERTKIT_FORM_ID,
      tagId: WAITLIST_TAG_ID
    })

    // Add subscriber to ConvertKit
    const subscriberData = {
      api_key: CONVERTKIT_API_KEY,
      email: email,
      fields: {
        source: 'circle-waitlist'
      }
    }

    // Add to main subscribers list/form
    const response = await fetch(`${CONVERTKIT_API_URL}/forms/${CONVERTKIT_FORM_ID}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[ConvertKit Waitlist] Subscribe failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      return NextResponse.json(
        { error: 'Failed to subscribe to waitlist. Please contact support.' },
        { status: 500 }
      )
    }

    const result = await response.json()
    console.log('[ConvertKit Waitlist] Subscription successful:', { subscriberId: result.subscription?.subscriber?.id })

    // Tag subscriber with Circle of Return waitlist tag
    if (result.subscription?.subscriber?.id && WAITLIST_TAG_ID) {
      try {
        await fetch(`${CONVERTKIT_API_URL}/tags/${WAITLIST_TAG_ID}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: CONVERTKIT_API_KEY,
            email: email
          })
        })
      } catch (tagError) {
        console.error('[ConvertKit Waitlist] Tagging failed:', tagError)
        // Don't fail the whole request if tagging fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined Circle of Return waitlist'
    })

  } catch (error) {
    console.error('[ConvertKit Waitlist] Error:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    )
  }
}
