import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const result = await query(`SELECT key, value FROM budget_settings`)
  const settings: Record<string, string> = {}
  result.rows.forEach((r: { key: string; value: string }) => { settings[r.key] = r.value })
  return NextResponse.json({ settings })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    for (const [key, value] of Object.entries(body)) {
      await query(
        `INSERT INTO budget_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`,
        [key, String(value)]
      )
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
