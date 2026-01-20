// Load environment variables
require('dotenv').config()

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false }
})

// Generate secure random password (12 characters)
function generatePassword() {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  const bytes = crypto.randomBytes(12)
  for (let i = 0; i < 12; i++) {
    password += charset[bytes[i] % charset.length]
  }
  return password
}

// Generate unique ID
function generateId() {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(12).toString('base64').replace(/[^a-z0-9]/gi, '').substring(0, 12)
  return `c${timestamp}${random}`
}

async function createMember() {
  const memberData = {
    email: 'leadbyexample76@outlook.com',
    name: 'Theodoros'
  }

  console.log('\n=== Creating Member Account ===')
  console.log(`Name: ${memberData.name}`)
  console.log(`Email: ${memberData.email}\n`)

  const client = await pool.connect()

  try {
    // Check if user already exists
    const existing = await client.query(
      'SELECT email FROM users WHERE email = $1',
      [memberData.email]
    )

    if (existing.rows.length > 0) {
      console.log('⚠️  User already exists. Deleting...')
      await client.query('DELETE FROM users WHERE email = $1', [memberData.email])
    }

    // Generate password and hash it
    const password = generatePassword()
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userId = generateId()
    const now = new Date()

    await client.query(
      `INSERT INTO users (id, email, name, password, role, level, "isActive", "joinDate", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [userId, memberData.email, memberData.name, hashedPassword, 'member', 'founding', true, now, now, now]
    )

    console.log('✅ Account Created Successfully!\n')
    console.log('═══════════════════════════════════════')
    console.log('LOGIN CREDENTIALS')
    console.log('═══════════════════════════════════════')
    console.log(`Name:     ${memberData.name}`)
    console.log(`Email:    ${memberData.email}`)
    console.log(`Password: ${password}`)
    console.log(`URL:      https://yourtruenorth.me/auth/login`)
    console.log('═══════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

createMember()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
