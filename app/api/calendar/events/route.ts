import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const calendarId = process.env.GOOGLE_CALENDAR_ID
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!serviceAccountEmail || !calendarId || !privateKey) {
      return NextResponse.json({ error: 'Missing Google Calendar credentials' }, { status: 500 })
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items?.map(event => ({
      title: event.summary || 'Untitled Event',
      date: event.start?.dateTime || event.start?.date || '',
      description: event.description || '',
    })) || []

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Calendar API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}
