import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const calendarId = process.env.GOOGLE_CALENDAR_ID
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!serviceAccountEmail || !calendarId || !privateKey || !siteUrl) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    const response = await calendar.events.watch({
      calendarId: calendarId,
      requestBody: {
        id: `truenorth-${Date.now()}`,
        type: 'web_hook',
        address: `${siteUrl}/api/calendar/webhook`,
      },
    })

    return NextResponse.json({ 
      success: true, 
      expiration: response.data.expiration,
      resourceId: response.data.resourceId
    })

  } catch (error) {
    console.error('Watch setup error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ info: 'POST to this endpoint to set up calendar watch' })
}
