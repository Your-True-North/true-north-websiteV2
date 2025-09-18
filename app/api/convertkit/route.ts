// app/api/convertkit/route.ts
import { NextRequest, NextResponse } from 'next/server'

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CONVERTKIT_API_URL = 'https://api.convertkit.com/v3'

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, source, soulMirrorResult } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Add subscriber to ConvertKit
    const subscriberData = {
      api_key: CONVERTKIT_API_KEY,
      email: email,
      first_name: firstName || '',
      fields: {
        source: source || 'website',
        soul_mirror_result: soulMirrorResult || ''
      }
    }

    // Add to main subscribers list
    const response = await fetch(`${CONVERTKIT_API_URL}/forms/THE_ECO_SYSTEM_ID/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData)
    })

    if (!response.ok) {
      throw new Error('Failed to add subscriber to ConvertKit')
    }

    const result = await response.json()

    // Tag based on source
    if (result.subscription?.subscriber?.id) {
      const subscriberId = result.subscription.subscriber.id
      
      // Apply tags based on source
      let tagId = null
      switch (source) {
        case 'soul-mirror-coaching':
          tagId = '1:1_INTEREST_TAG_ID'
          break
        case 'soul-mirror-circle':
          tagId = 'THE_CoR_TAG_ID'
          break
        case 'soul-mirror-library':
          tagId = 'THE_LIBRARY_TAG_ID'
          break
        case 'free-library':
          tagId = 'THE_LIBRARY_TAG_ID'
          break
        case 'circle-waitlist':
          tagId = 'THE_CoR_WAITLIST_TAG_ID'
          break
        case 'contact-form':
          tagId = 'CONTACT_TAG_ID'
          break
      }

      if (tagId) {
        await fetch(`${CONVERTKIT_API_URL}/tags/${tagId}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: CONVERTKIT_API_KEY,
            email: email
          })
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to updates',
      subscriber: result.subscription?.subscriber 
    })

  } catch (error) {
    console.error('ConvertKit API Error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' }, 
      { status: 500 }
    )
  }
}