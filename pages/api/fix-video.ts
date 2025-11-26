import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  
  await client.query(`
    UPDATE videos 
    SET "youtubeId" = 'L7Pk4xNO63U',
        "youtubeUrl" = 'https://www.youtube.com/watch?v=L7Pk4xNO63U'
    WHERE id = 'video-1764168377936'
  `)
  
  const result = await client.query('SELECT * FROM videos')
  
  await client.end()
  return res.json({ fixed: true, videos: result.rows })
}
