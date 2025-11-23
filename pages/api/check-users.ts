import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()
    
    const result = await client.query(
      `SELECT email, role, "stripeCustomerId", "isActive", "createdAt" 
       FROM users 
       WHERE email IN ('mason@masondysonroberts.com', 'ali@555evolution.com') 
       ORDER BY "createdAt" DESC`
    )
    
    await client.end()
    return res.json({ users: result.rows })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
