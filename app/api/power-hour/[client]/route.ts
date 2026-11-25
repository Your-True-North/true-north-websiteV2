import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { POWER_HOUR_CLIENTS } from '@/lib/power-hour'

// Public, no sign-in: ticks and notes for Power Hour client pages.

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
    return NextResponse.json({ error: 'Could not load' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client } = await params
  const cfg = getClientConfig(client)
  if (!cfg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }
  try {
    await ensureTables()
    if (body?.type === 'tick') {
      const { day, item, done } = body
      if (typeof day !== 'string' || !DAY.test(day) || !cfg.items.some((i) => i.key === item) || typeof done !== 'boolean') {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 })
      }
      await query(
        `INSERT INTO power_hour_ticks (client, day, item, done, updated_at) VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (client, day, item) DO UPDATE SET done = $4, updated_at = NOW()`,
        [client, day, item, done]
      )
      return NextResponse.json({ ok: true })
    }
    if (body?.type === 'note') {
      const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : ''
      if (!text) return NextResponse.json({ error: 'Empty note' }, { status: 400 })
      await query('INSERT INTO power_hour_notes (client, body) VALUES ($1, $2)', [client, text])
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  } catch (e) {
    console.error('[power-hour] POST', e)
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }
}
