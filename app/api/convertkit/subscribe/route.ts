import { NextResponse } from 'next/server';

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
const LIBRARY_TAG_ID = process.env.THE_LIBRARY_TAG_ID || '7654321';

export async function POST(request: Request) {
  try {
    const { email, firstName, tag, resource } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    if (!CONVERTKIT_API_KEY) {
      console.error('[Library Subscribe] Missing CONVERTKIT_API_KEY')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[Library Subscribe] Processing subscription:', {
      email,
      firstName,
      tag,
      resource,
      tagId: LIBRARY_TAG_ID,
      hasApiKey: !!CONVERTKIT_API_KEY
    })

    const response = await fetch(
      `https://api.convertkit.com/v3/tags/${LIBRARY_TAG_ID}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: CONVERTKIT_API_KEY,
          email: email,
          first_name: firstName || '',
          fields: {
            resource_requested: resource || 'General Library Access'
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[Library Subscribe] ConvertKit API error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      return NextResponse.json(
        { error: 'Failed to subscribe to library. Please contact support.' },
        { status: 500 }
      );
    }

    console.log('[Library Subscribe] Success:', {
      subscriberId: data.subscription?.subscriber?.id,
      email: email,
      resource
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Library Subscribe] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
