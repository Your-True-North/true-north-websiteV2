import { NextRequest, NextResponse } from 'next/server'
import { STRUGGLES, GOALS, OWN_WORDS_MAX } from '../../../shortfuse/questions'
import { checkToken } from '../token'

// Optional follow-up questions shown after a Short Fuse signup. Saves the answers
// to the subscriber's custom fields in Kit (struggles, goal, own_words) using the
// v4 API's update subscriber call. Only works with the token the signup handed
// back, which holds that subscriber's id and only matches their email.
// Always answers ok: he never sees an error for this step. Failures are logged.
const KIT = 'https://api.kit.com/v4'

const ok = () => NextResponse.json({ ok: true })

function plainText(v: unknown) {
  if (typeof v !== 'string') return ''
  return v
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, OWN_WORDS_MAX)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : ''
  const id = email ? checkToken(email, body?.token) : null
  if (!id) {
    console.error(`[shortfuse answers] Refused: no valid signup token for ${email || 'unknown email'}`)
    return ok()
  }

  // Only the exact options on the page are accepted, kept in page order
  const picked = Array.isArray(body.struggles) ? body.struggles : []
  const struggles = STRUGGLES.filter(option => picked.includes(option))
  const goal = GOALS.find(option => option === body.goal)
  const ownWords = plainText(body.own_words)

  // Leave out anything not answered, so no field is ever blanked
  const fields: Record<string, string> = {}
  if (struggles.length) fields.struggles = struggles.join(' | ')
  if (goal) fields.goal = goal
  if (ownWords) fields.own_words = ownWords
  if (!Object.keys(fields).length) return ok()

  const apiKey = process.env.KIT_API_KEY as string
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Kit-Api-Key': apiKey }

  try {
    const updated = await fetch(`${KIT}/subscribers/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ email_address: email, fields }),
    })
    const text = await updated.text()
    if (!updated.ok) throw new Error(`update subscriber ${updated.status}: ${text}`)
    if (text.includes('"warnings"')) console.warn(`[shortfuse answers] Kit warnings for ${email}: ${text}`)
  } catch (err: any) {
    console.error(`[shortfuse answers] Saving answers for ${email} failed:`, err.message)
  }
  return ok()
}
