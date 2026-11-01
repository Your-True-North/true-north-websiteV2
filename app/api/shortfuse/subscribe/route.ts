import { NextRequest, NextResponse } from 'next/server'
import { LINES } from '../../../shortfuse/questions'
import { issueToken } from '../token'

// The Short Fuse opt-in (/shortfuse). Adds the person to the Short Fuse form in
// Kit using the v4 API: create or update the subscriber (UTMs and the "That's me"
// lines they ticked),
// add them to the form, then tag them "Short Fuse".
// Needs KIT_API_KEY (a v4 key), KIT_SHORT_FUSE_FORM_ID and KIT_SHORT_FUSE_TAG_ID.
const KIT = 'https://api.kit.com/v4'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  // Honeypot filled in: a bot. Look successful, do nothing.
  if (clean(body.company, 200)) return NextResponse.json({ ok: true })

  const email = clean(body.email, 254).toLowerCase()
  if (!EMAIL.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 422 })
  const firstName = clean(body.first_name, 100)
  const referrer = clean(body.referrer, 1000)

  const fields: Record<string, string> = {}
  if (body.utm && typeof body.utm === 'object') {
    for (const key of UTM_KEYS) {
      const value = clean(body.utm[key], 255)
      if (value) fields[key] = value
    }
  }
  // "That's me" lines ticked before signing up, sent as line numbers
  if (Array.isArray(body.recognised)) {
    const ticked = LINES.filter((_, i) => body.recognised.includes(i))
    if (ticked.length) fields.recognised = ticked.join(' | ')
  }

  const apiKey = process.env.KIT_API_KEY
  const formId = process.env.KIT_SHORT_FUSE_FORM_ID
  if (!apiKey || !formId) {
    console.error('[shortfuse] KIT_API_KEY or KIT_SHORT_FUSE_FORM_ID is not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const kit = (path: string, payload: object) =>
    fetch(`${KIT}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Kit-Api-Key': apiKey },
      body: JSON.stringify(payload),
    })

  try {
    // 1. Create or update the subscriber. If Kit refuses the custom fields (for
    // example the custom fields don't exist yet), try once more without them
    // so the signup still goes through.
    const subscriber = { email_address: email, ...(firstName ? { first_name: firstName } : {}) }
    let res = await kit('/subscribers', Object.keys(fields).length ? { ...subscriber, fields } : subscriber)
    if (res.status === 422 && Object.keys(fields).length) {
      console.warn('[shortfuse] Kit refused the custom fields:', await res.text())
      res = await kit('/subscribers', subscriber)
    }
    if (res.status === 422) return NextResponse.json({ error: 'Invalid email' }, { status: 422 })
    if (!res.ok) throw new Error(`create subscriber ${res.status}: ${await res.text()}`)

    // 2. Add them to the Short Fuse form, which starts the tag and sequence.
    const added = await kit(`/forms/${encodeURIComponent(formId)}/subscribers`, {
      email_address: email,
      ...(referrer ? { referrer } : {}),
    })
    if (!added.ok) throw new Error(`add to form ${added.status}: ${await added.text()}`)

    // 3. Tag them "Short Fuse". They're signed up by now, so if tagging fails
    // it's logged and the signup still succeeds.
    const tagId = process.env.KIT_SHORT_FUSE_TAG_ID
    if (!tagId) {
      console.error(`[shortfuse] KIT_SHORT_FUSE_TAG_ID is not set, so ${email} was not tagged`)
    } else {
      try {
        const tagged = await kit(`/tags/${encodeURIComponent(tagId)}/subscribers`, { email_address: email })
        if (!tagged.ok) console.error(`[shortfuse] Tagging ${email} with tag ${tagId} failed: ${tagged.status} ${await tagged.text()}`)
      } catch (err: any) {
        console.error(`[shortfuse] Tagging ${email} with tag ${tagId} failed:`, err.message)
      }
    }

    // The token lets this browser save the optional follow-up answers
    return NextResponse.json({ ok: true, token: issueToken(email) })
  } catch (err: any) {
    console.error('[shortfuse] Kit:', err.message)
    return NextResponse.json({ error: 'Kit error' }, { status: 502 })
  }
}
