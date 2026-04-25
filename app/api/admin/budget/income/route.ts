import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const result = await query(`SELECT * FROM budget_income ORDER BY added_at DESC LIMIT 20`)
  return NextResponse.json({ income: result.rows })
}

export async function POST(request: NextRequest) {
  try {
    const { amount, description } = await request.json()
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
    }

    // Auto-save based on savings_pct setting
    const settingRes = await query(`SELECT value FROM budget_settings WHERE key = 'savings_pct'`)
    const pct = parseFloat(settingRes.rows[0]?.value || '10')
    const savingsAmount = Math.round(amount * pct / 100 * 100) / 100

    const income = await query(
      `INSERT INTO budget_income (amount, description) VALUES ($1, $2) RETURNING *`,
      [amount, description || '']
    )

    // Automatically set aside savings
    await query(
      `INSERT INTO budget_savings (amount, note) VALUES ($1, $2)`,
      [savingsAmount, `Auto-saved ${pct}% from income of £${amount}`]
    )

    return NextResponse.json({ income: income.rows[0], savedAmount: savingsAmount })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to add income' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await query(`DELETE FROM budget_income WHERE id = $1`, [id])
  return NextResponse.json({ success: true })
}
