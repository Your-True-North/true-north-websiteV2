// Load environment variables from .env file if it exists
try {
  require('dotenv').config()
} catch (e) {
  console.log('Note: dotenv not available, using existing environment variables')
}

const { Pool } = require('pg')

// Validate environment variables
if (!process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL) {
  console.error('\n❌ ERROR: DATABASE_URL or DATABASE_PUBLIC_URL environment variable is required')
  process.exit(1)
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function listAllUsers() {
  const client = await pool.connect()

  console.log('\n=== FULL DATABASE USER LIST ===\n')

  try {
    // Get ALL users with all details
    const result = await client.query(`
      SELECT
        id,
        email,
        name,
        role,
        level,
        "isActive",
        "createdAt",
        "updatedAt"
      FROM users
      ORDER BY "createdAt" DESC
    `)

    console.log(`Total users found: ${result.rows.length}\n`)
    console.log('=' .repeat(100))

    result.rows.forEach((user, index) => {
      console.log(`\n#${index + 1}`)
      console.log(`Name: ${user.name}`)
      console.log(`Email: ${user.email}`)
      console.log(`ID: ${user.id}`)
      console.log(`Role: ${user.role}`)
      console.log(`Level: ${user.level}`)
      console.log(`Active: ${user.isActive}`)
      console.log(`Created: ${user.createdAt}`)
      console.log(`Updated: ${user.updatedAt}`)
    })

    console.log('\n' + '='.repeat(100))

    // Specifically highlight our target users
    console.log('\n=== TARGET USERS ===\n')

    const alex = result.rows.find(u => u.email === 'alexantoniou29@gmail.com')
    const theo = result.rows.find(u => u.email === 'leadbyexample76@outlook.com')

    if (alex) {
      console.log('✅ FOUND: Alex Antoniou')
      console.log(`   Email: ${alex.email}`)
      console.log(`   ID: ${alex.id}`)
      console.log(`   Created: ${alex.createdAt}`)
    } else {
      console.log('❌ NOT FOUND: alexantoniou29@gmail.com')
    }

    if (theo) {
      console.log('✅ FOUND: Theodoros')
      console.log(`   Email: ${theo.email}`)
      console.log(`   ID: ${theo.id}`)
      console.log(`   Created: ${theo.createdAt}`)
    } else {
      console.log('❌ NOT FOUND: leadbyexample76@outlook.com')
    }

    // Show the exact SQL you can run in Railway
    console.log('\n=== SQL TO RUN IN RAILWAY QUERY TAB ===\n')
    console.log('Copy and paste this into Railway:')
    console.log('')
    console.log('SELECT * FROM users WHERE email IN (\'alexantoniou29@gmail.com\', \'leadbyexample76@outlook.com\');')
    console.log('')

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error)
  } finally {
    client.release()
    await pool.end()
  }
}

// Run verification
listAllUsers()
  .then(() => {
    console.log('\n✅ Complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  })
