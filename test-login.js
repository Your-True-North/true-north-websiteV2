const { Client } = require('pg')
const bcrypt = require('bcryptjs')

async function test() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  await client.connect()
  
  const result = await client.query('SELECT * FROM users WHERE email = $1', ['navigate@yourtruenorth.me'])
  const user = result.rows[0]
  
  console.log('User columns:', Object.keys(user))
  console.log('Has password field:', 'password' in user)
  console.log('Password value type:', typeof user.password)
  
  await client.end()
}

test()
