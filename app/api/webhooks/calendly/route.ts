import { NextRequest, NextResponse } from 'next/server'

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY

const SEQUENCE_MAP: Record<string, string> = {
  'breathwork-journey': '17656423',
  'energy-healing-experience': '17656427',
}

function subscribeToSequence(email: string, firstName: string, sequenceId: string) {
  if (!CONVERTKIT_API_KEY) return
  fetch(`https://api.convertkit.com/v3/sequences/${sequenceId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_secret: CONVERTKIT_API_KEY,
      email,
      first_name: firstName,
    }),
  }).catch((err) => console.error(`[Calendly Webhook] ConvertKit sequence ${sequenceId} failed:`, err))
}

export async function POST(req: NextRequest) {
  let body: any

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = body?.event
  const payload = body?.payload

  console.log('[Calendly Webhook] Event received:', event)

  // Only handle confirmed bookings
  if (event !== 'invitee.created') {
    return NextResponse.json({ received: true })
  }

  const email = payload?.email
  const name = payload?.name || ''
  const firstName = name.split(' ')[0] || ''

  // Get event type slug from the URI — format: .../event_types/{slug}/...
  // Calendly also provides event_type.name — we match on the scheduled_event URI slug
  const eventTypeUri: string = payload?.scheduled_event?.event_type || ''
  const eventTypeName: string = (payload?.event_type?.name || '').toLowerCase().replace(/\s+/g, '-')

  // Try slug from URI first, fall back to name-derived slug
  const uriSlug = eventTypeUri.split('/').pop() || ''

  // Match against known slugs
  const slug = SEQUENCE_MAP[uriSlug] ? uriSlug : eventTypeName
  const sequenceId = SEQUENCE_MAP[slug]

  if (!email) {
    console.error('[Calendly Webhook] No email in payload')
    return NextResponse.json({ received: true })
  }

  if (!sequenceId) {
    console.log(`[Calendly Webhook] No sequence mapped for slug: "${slug}" (uri slug: "${uriSlug}", name slug: "${eventTypeName}")`)
    return NextResponse.json({ received: true })
  }

  console.log(`[Calendly Webhook] Booking confirmed — ${slug} for ${email}, enrolling in sequence ${sequenceId}`)
  subscribeToSequence(email, firstName, sequenceId)

  return NextResponse.json({ received: true })
}
