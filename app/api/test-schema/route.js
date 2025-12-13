import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'videos'
      ORDER BY ordinal_position
    `
    return NextResponse.json({ 
      table: 'videos',
      columns: result.rows 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
