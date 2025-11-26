import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  
  const result = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'videos'
    ORDER BY ordinal_position
  `)
  
  await client.end()
  return res.json({ columns: result.rows })
}
