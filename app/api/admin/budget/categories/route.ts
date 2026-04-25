import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const result = await query(`SELECT * FROM budget_categories ORDER BY bucket, name`)
  return NextResponse.json({ categories: result.rows })
}

export async function POST(request: NextRequest) {
  try {
    const { name, bucket, monthly_limit } = await request.json()
    if (!name || !bucket) return NextResponse.json({ error: 'Name and bucket required' }, { status: 400 })

    const result = await query(
      `INSERT INTO budget_categories (name, bucket, monthly_limit) VALUES ($1, $2, $3) RETURNING *`,
      [name, bucket, monthly_limit || 0]
    )
    return NextResponse.json({ category: result.rows[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, name, monthly_limit } = await request.json()
    const result = await query(
      `UPDATE budget_categories SET name = COALESCE($1, name), monthly_limit = COALESCE($2, monthly_limit) WHERE id = $3 RETURNING *`,
      [name, monthly_limit, id]
    )
    return NextResponse.json({ category: result.rows[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await query(`DELETE FROM budget_categories WHERE id = $1`, [id])
  return NextResponse.json({ success: true })
}
