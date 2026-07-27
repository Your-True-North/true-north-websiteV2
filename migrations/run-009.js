const fs = require('fs')
const { query } = require('../lib/db.js')

async function runMigration() {
  const sql = fs.readFileSync('migrations/009_kyn_session_loop_fields.sql', 'utf8')
  const statements = sql.split(';').filter(s => s.trim())

  for (const statement of statements) {
    if (!statement.trim()) continue
    try {
      console.log('Running:', statement.substring(0, 50) + '...')
      await query(statement)
      console.log('✓ Success')
    } catch (error) {
      console.error('✗ FAILED:', error.message)
      process.exit(1)
    }
  }
  console.log('✅ Migration complete')
}

runMigration()
