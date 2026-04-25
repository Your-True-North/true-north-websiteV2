import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const result = await query(`
    SELECT e.*, c.name as category_name, c.bucket
    FROM budget_expenses e
    LEFT JOIN budget_categories c ON c.id = e.category_id
    ORDER BY e.logged_at DESC LIMIT 50
  `)
  return NextResponse.json({ expenses: result.rows })
}

export async function POST(request: NextRequest) {
  try {
    const { amount, category_id, description } = await request.json()
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO budget_expenses (amount, category_id, description) VALUES ($1, $2, $3) RETURNING *`,
      [amount, category_id || null, description || '']
    )
    return NextResponse.json({ expense: result.rows[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to log expense' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await query(`DELETE FROM budget_expenses WHERE id = $1`, [id])
  return NextResponse.json({ success: true })
}
