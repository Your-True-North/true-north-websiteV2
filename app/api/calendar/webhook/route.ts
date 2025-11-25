import { NextRequest, NextResponse } from 'next/server'

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CONVERTKIT_TAG_ID = '8362450'
const CONVERTKIT_TEMPLATE_ID = '4278176'

export async function POST(request: NextRequest) {
  try {
    const resourceState = request.headers.get('x-goog-resource-state')
    
    if (resourceState !== 'exists') {
      return NextResponse.json({ received: true })
    }

    const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/calendar/events`)
    const calendarData = await calendarResponse.json()
    
    if (!calendarData.events || calendarData.events.length === 0) {
      return NextResponse.json({ received: true, message: 'No events' })
    }

    const nextEvent = calendarData.events[0]
    const eventDate = new Date(nextEvent.start || nextEvent.date)
    
    const createResponse = await fetch(`https://api.convertkit.com/v3/broadcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: CONVERTKIT_API_KEY,
        subject: `New Circle Session: ${nextEvent.title || nextEvent.summary}`,
        email_template_id: CONVERTKIT_TEMPLATE_ID,
        public: false,
        subscriber_filter: { tag_ids: [CONVERTKIT_TAG_ID] },
        content: {
          event_title: nextEvent.title || nextEvent.summary,
          event_date: eventDate.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          event_time: eventDate.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          event_description: nextEvent.description || 'Join us for this Circle session'
        }
      })
    })

    const createResult = await createResponse.json()
    const broadcastId = createResult.broadcast?.id
    
    if (!broadcastId) {
      throw new Error('Failed to create broadcast')
    }

    const sendResponse = await fetch(`https://api.convertkit.com/v3/broadcasts/${broadcastId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: CONVERTKIT_API_KEY
      })
    })

    const sendResult = await sendResponse.json()
    
    return NextResponse.json({ 
      success: true, 
      broadcastId,
      sent: sendResult 
    })

  } catch (error) {
    console.error('[Calendar Webhook] Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active' })
}
