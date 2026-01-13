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

async function verifyDatabase() {
  const client = await pool.connect()

  console.log('\n=== Database Connection Verification ===\n')
  console.log('Connection String:', (process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL).replace(/:[^:@]+@/, ':****@'))

  try {
    // Check database connection
    const dbResult = await client.query('SELECT current_database(), current_user')
    console.log('\n✓ Connected to database:', dbResult.rows[0].current_database)
    console.log('✓ Connected as user:', dbResult.rows[0].current_user)

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `)
    console.log('✓ Users table exists:', tableCheck.rows[0].exists)

    // Count all users
    const countResult = await client.query('SELECT COUNT(*) FROM users')
    console.log('\n📊 Total users in database:', countResult.rows[0].count)

    // Check for Alex and Theodoros
    const checkUsers = await client.query(`
      SELECT id, email, name, role, level, "isActive", "createdAt"
      FROM users
      WHERE email IN ('alexantoniou29@gmail.com', 'leadbyexample76@outlook.com')
      ORDER BY email
    `)

    console.log('\n=== Target Users ===\n')

    if (checkUsers.rows.length === 0) {
      console.log('❌ No users found for:')
      console.log('   - alexantoniou29@gmail.com')
      console.log('   - leadbyexample76@outlook.com')
    } else {
      checkUsers.rows.forEach(user => {
        console.log(`✓ Found: ${user.name} (${user.email})`)
        console.log(`  ID: ${user.id}`)
        console.log(`  Role: ${user.role}`)
        console.log(`  Level: ${user.level}`)
        console.log(`  Active: ${user.isActive}`)
        console.log(`  Created: ${user.createdAt}`)
        console.log()
      })
    }

    // List all users in database
    const allUsers = await client.query(`
      SELECT email, name, role, level
      FROM users
      ORDER BY "createdAt" DESC
      LIMIT 10
    `)

    console.log('\n=== Recent Users in Database (Last 10) ===\n')
    allUsers.rows.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}/${user.level}`)
    })

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error)
  } finally {
    client.release()
    await pool.end()
  }
}

// Run verification
verifyDatabase()
  .then(() => {
    console.log('\n✅ Verification complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  })
