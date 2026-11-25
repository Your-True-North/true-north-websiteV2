import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'
import { rateLimit } from '@/lib/auth'
import { POWER_HOUR_CLIENTS } from '@/lib/power-hour'

// Public, no sign-in: ticks and notes for Power Hour client pages.
// If the database can't be reached, ticks stay on the client's phone and notes still reach True by email.

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KYN <kyn@yourtruenorth.me>'
const TO_EMAIL = process.env.ADMIN_CONTACT_EMAIL || 'navigate@yourtruenorth.me'

const DAY = /^\d{4}-\d{2}-\d{2}$/

let ready: Promise<unknown> | null = null
function ensureTables() {
  if (!ready) {
    ready = (async () => {
      await query(`CREATE TABLE IF NOT EXISTS power_hour_ticks (
        client TEXT NOT NULL, day TEXT NOT NULL, item TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE, updated_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (client, day, item))`)
      await query(`CREATE TABLE IF NOT EXISTS power_hour_notes (
        id SERIAL PRIMARY KEY, client TEXT NOT NULL, body TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW())`)
    })().catch((e) => { ready = null; throw e })
  }
  return ready
}

function getClientConfig(slug: string) {
  return Object.prototype.hasOwnProperty.call(POWER_HOUR_CLIENTS, slug) ? POWER_HOUR_CLIENTS[slug] : null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client } = await params
  const cfg = getClientConfig(client)
  if (!cfg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    await ensureTables()
    const ticks = await query(
      'SELECT day, item, done FROM power_hour_ticks WHERE client = $1 AND day >= $2',
      [client, cfg.start]
    )
    const notes = await query(
      'SELECT body, created_at FROM power_hour_notes WHERE client = $1 ORDER BY created_at DESC LIMIT 20',
      [client]
    )
    const byDay: Record<string, Record<string, boolean>> = {}
    for (const r of ticks.rows) (byDay[r.day] ||= {})[r.item] = r.done
    return NextResponse.json(
      { ticks: byDay, notes: notes.rows.map((n: any) => ({ t: n.body, at: n.created_at })) },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e) {
    console.error('[power-hour] GET', e)
    const code = (e as any)?.code || (e as any)?.name || 'unknown'
    return NextResponse.json({ ticks: {}, notes: [], offline: true, code }, { headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client } = await params
  const cfg = getClientConfig(client)
  if (!cfg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }
  if (body?.type === 'tick') {
    const { day, item, done } = body
    if (typeof day !== 'string' || !DAY.test(day) || !cfg.items.some((i) => i.key === item) || typeof done !== 'boolean') {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }
    try {
      await ensureTables()
      await query(
        `INSERT INTO power_hour_ticks (client, day, item, done, updated_at) VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (client, day, item) DO UPDATE SET done = $4, updated_at = NOW()`,
        [client, day, item, done]
      )
      return NextResponse.json({ ok: true, saved: true })
    } catch (e) {
      console.error('[power-hour] tick', e)
      return NextResponse.json({ ok: true, saved: false })
    }
  }
  if (body?.type === 'note') {
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : ''
    if (!text) return NextResponse.json({ error: 'Empty note' }, { status: 400 })
    if (rateLimit(`power-hour-note:${client}`, 20, 60 * 60 * 1000).limited) {
      return NextResponse.json({ error: 'Too many notes. Try again later.' }, { status: 429 })
    }
    let saved = false, emailed = false
    try {
      await ensureTables()
      await query('INSERT INTO power_hour_notes (client, body) VALUES ($1, $2)', [client, text])
      saved = true
    } catch (e) { console.error('[power-hour] note db', e) }
    const why: string[] = []
    if (!process.env.RESEND_API_KEY) why.push('no email key set')
    for (const from of Array.from(new Set([FROM_EMAIL, 'True North <navigate@yourtruenorth.me>']))) {
      if (emailed) break
      try {
        const { error } = await resend.emails.send({
          from,
          to: TO_EMAIL,
          subject: `Power Hour note from ${cfg.name}`,
          text: `${text}\n\n\nFrom ${cfg.name}'s Power Hour page: https://yourtruenorth.me/${cfg.slug}`,
        })
        if (error) throw error
        emailed = true
      } catch (e: any) {
        console.error('[power-hour] note email', from, e)
        why.push(String(e?.name || 'error') + ': ' + String(e?.message || '').slice(0, 160))
      }
    }
    if (!saved && !emailed) return NextResponse.json({ error: 'Could not send', why }, { status: 500 })
    return NextResponse.json({ ok: true, saved, emailed })
  }
  return NextResponse.json({ error: 'Bad request' }, { status: 400 })
}
