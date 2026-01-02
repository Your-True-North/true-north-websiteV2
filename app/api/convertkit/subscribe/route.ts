import { NextResponse } from 'next/server';

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;

// Resource-specific tag IDs
const RESOURCE_TAG_MAP: { [key: string]: string } = {
  "Realistic Anger Management": process.env.THE_LIBRARY_ANGER_MANAGEMENT_TAG_ID || '',
  "The Space Method": process.env.THE_LIBRARY_SPACE_METHOD_TAG_ID || '',
  "Take Back Control": process.env.THE_LIBRARY_TAKE_BACK_CONTROL_TAG_ID || '',
  "A Mans Guide to Knowing Himself": process.env.THE_LIBRARY_MANS_GUIDE_TAG_ID || '',
  "Integration Journal": process.env.THE_LIBRARY_INTEGRATION_JOURNAL_TAG_ID || '',
  "Awaken The Truth": process.env.THE_LIBRARY_AWAKEN_THE_TRUTH_TAG_ID || ''
};

// Fallback to generic library tag if resource-specific tag not found
const LIBRARY_TAG_ID = process.env.THE_LIBRARY_TAG_ID || '10466971';

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

    // Get resource-specific tag ID, or fall back to generic library tag
    const resourceTagId = resource && RESOURCE_TAG_MAP[resource]
      ? RESOURCE_TAG_MAP[resource]
      : LIBRARY_TAG_ID;

    console.log('[Library Subscribe] Processing subscription:', {
      email,
      firstName,
      resource,
      resourceTagId,
      usingResourceSpecificTag: !!(resource && RESOURCE_TAG_MAP[resource]),
      hasApiKey: !!CONVERTKIT_API_KEY
    })

    const response = await fetch(
      `https://api.convertkit.com/v3/tags/${resourceTagId}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_secret: CONVERTKIT_API_KEY,
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
