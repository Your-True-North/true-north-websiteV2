import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  
  const hashedPassword = await bcrypt.hash('TemsRiver123', 10)
  
  await client.query(
    `INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET password = $4, role = $5`,
    ['admin-cor', 'cor@yourtruenorth.me', 'Admin', hashedPassword, 'admin', true]
  )
  
  const result = await client.query(
    `SELECT email, role FROM users WHERE email = 'cor@yourtruenorth.me'`
  )
  
  await client.end()
  return res.json({ created: result.rows[0] })
}
