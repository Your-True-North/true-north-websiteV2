import { NextResponse } from 'next/server';

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
const LIBRARY_TAG_ID = 'THE_LIBRARY_TAG_ID';

export async function POST(request: Request) {
  try {
    const { email, firstName, tag, resource } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

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
      console.error('ConvertKit error:', data);
      return NextResponse.json(
        { error: 'Failed to subscribe to library' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Library subscription error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
