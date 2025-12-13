import { NextResponse } from 'next/server'
import pg from 'pg'

export async function GET() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    await client.connect()
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'videos'
      ORDER BY ordinal_position
    `)
    await client.end()
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
