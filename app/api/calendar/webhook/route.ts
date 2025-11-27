import { NextRequest, NextResponse } from 'next/server'

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const GOOGLE_CALENDAR_EVENT_TAG = '12657376'
const SESSION_NOTIFY_TAG = '12902604'
const ZOOM_LINK = 'https://us02web.zoom.us/j/87536119646?pwd=hQplce2Qb3icHt82ZTBNnQaKa1ib98.1'

export async function POST(request: NextRequest) {
  console.log('[Calendar Webhook] Received request')
  
  try {
    const resourceState = request.headers.get('x-goog-resource-state')
    
    if (resourceState !== 'exists') {
      return NextResponse.json({ received: true, action: 'ignored' })
    }

    const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/calendar/events`)
    const calendarData = await calendarResponse.json()
    
    if (!calendarData.events || calendarData.events.length === 0) {
      console.log('[Calendar Webhook] No events found')
      return NextResponse.json({ received: true, message: 'No events' })
    }

    const nextEvent = calendarData.events[0]
    const eventDate = new Date(nextEvent.date)
    
    const eventFields = {
      event_title: nextEvent.title || 'Circle Session',
      event_date: eventDate.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      event_time: eventDate.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      event_description: nextEvent.description || 'Join us for this Circle session',
      event_link: ZOOM_LINK
    }

    console.log('[Calendar Webhook] Event:', eventFields.event_title)

    const subscribersResponse = await fetch(
      `https://api.convertkit.com/v3/tags/${GOOGLE_CALENDAR_EVENT_TAG}/subscriptions?api_secret=${CONVERTKIT_API_KEY}`
    )
    
    if (!subscribersResponse.ok) {
      console.error('[Calendar Webhook] Failed to fetch subscribers')
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
    }
    
    const subscribersData = await subscribersResponse.json()
    
    if (!subscribersData.subscriptions || subscribersData.subscriptions.length === 0) {
      console.log('[Calendar Webhook] No subscribers found')
      return NextResponse.json({ received: true, message: 'No subscribers' })
    }

    console.log(`[Calendar Webhook] Found ${subscribersData.subscriptions.length} subscribers`)

    let updated = 0
    
    for (const subscription of subscribersData.subscriptions) {
      const email = subscription.subscriber.email_address
      
      const updateResponse = await fetch(
        `https://api.convertkit.com/v3/tags/${SESSION_NOTIFY_TAG}/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_secret: CONVERTKIT_API_KEY,
            email: email,
            fields: eventFields
          })
        }
      )
      
      if (updateResponse.ok) {
        updated++
        console.log(`[Calendar Webhook] Updated and tagged: ${email}`)
      } else {
        console.error(`[Calendar Webhook] Failed for ${email}`)
      }
    }

    console.log(`[Calendar Webhook] Complete. Updated ${updated} subscribers`)
    return NextResponse.json({ 
      success: true, 
      updated,
      event: eventFields.event_title
    })

  } catch (error) {
    console.error('[Calendar Webhook] Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active' })
}
