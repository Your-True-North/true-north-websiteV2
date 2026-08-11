import { NextResponse } from 'next/server'
import { Resend } from 'resend'
// Relative imports on purpose: next.config.js aliases "@/lib" to app/lib,
// so "@/lib/anger-decoder/..." would not resolve to the root lib directory.
import { assertServerEnv, warnMissingServerEnv } from '../../../../lib/anger-decoder/config'
import { buildPersonalisation } from '../../../../lib/anger-decoder/ai'
import { buildResultEmail, buildSafetyEmail } from '../../../../lib/anger-decoder/emails'
import { FREETEXT_QUESTION_ID } from '../../../../lib/anger-decoder/questions'
import { scoreAnswers, type AnswerMap } from '../../../../lib/anger-decoder/score'

// Loud on boot. The request path throws, so a missing secret is never silent.
warnMissingServerEnv()

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'True <kyn@yourtruenorth.me>'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* ── rate limiting, in memory, per IP ── */
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [key, times] of hits.entries()) {
      if (times.every((t) => now - t > RATE_WINDOW_MS)) hits.delete(key)
    }
  }
  return recent.length > RATE_LIMIT
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

/* ── Kit (ConvertKit) ── */

async function subscribeToKit(
  email: string,
  tags: string[],
  freeText: string
): Promise<void> {
  const apiKey = process.env.KIT_API_KEY
  const formId = process.env.KIT_FORM_ID
  if (!apiKey || !formId) return

  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: apiKey,
        email,
        tags,
        fields: { decoder_freetext: freeText.slice(0, 2000) },
      }),
    })
    if (!res.ok) {
      console.error('[anger-decoder] Kit subscribe failed:', res.status, await res.text())
    }
  } catch (error: any) {
    console.error('[anger-decoder] Kit subscribe threw:', error?.message || error)
  }
}

/* ── handler ── */

export async function POST(request: Request) {
  try {
    assertServerEnv()
  } catch (error: any) {
    console.error(error?.message || error)
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 })
  }

  const ip = clientIp(request)
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  let payload: { email?: unknown; answers?: unknown }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }

  const answers = (payload.answers && typeof payload.answers === 'object'
    ? payload.answers
    : {}) as AnswerMap

  // Never trust client scoring. Recompute from the raw answers.
  const scoring = scoreAnswers(answers)
  const { dominant, secondary, flagSafety } = scoring

  const rawFreeText = answers[FREETEXT_QUESTION_ID]
  const freeText = typeof rawFreeText === 'string' ? rawFreeText : ''

  const origin =
    request.headers.get('origin') ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://yourtruenorth.me'

  const resend = new Resend(process.env.RESEND_API_KEY)

  const tags = [
    `root_${dominant}`,
    `secondary_${secondary}`,
    'source_anger_decoder',
    ...(flagSafety ? ['flag_safety'] : []),
  ]

  await subscribeToKit(email, tags, freeText)

  /* Safety branch bypasses all marketing. No AI call, no offer, no links. */
  if (flagSafety) {
    const safety = buildSafetyEmail(dominant)
    try {
      const res = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: safety.subject,
        html: safety.html,
        text: safety.text,
      })
      if (res.error) throw new Error(JSON.stringify(res.error))
    } catch (error: any) {
      console.error('[anger-decoder] safety email failed:', error?.message || error)
      return NextResponse.json({ error: 'Could not send your result' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, dominant, safety: true })
  }

  // Degrades to an empty string on failure or timeout. Never blocks the send.
  const aiParagraph = await buildPersonalisation(freeText, dominant, secondary)

  const built = buildResultEmail(dominant, secondary, aiParagraph, origin)

  try {
    const res = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: built.subject,
      html: built.html,
      text: built.text,
    })
    if (res.error) throw new Error(JSON.stringify(res.error))
  } catch (error: any) {
    console.error('[anger-decoder] result email failed:', error?.message || error)
    return NextResponse.json({ error: 'Could not send your result' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    dominant,
    secondary,
    closeCall: scoring.closeCall,
    personalised: aiParagraph.length > 0,
  })
}
