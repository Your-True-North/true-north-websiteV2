const bcrypt = require('bcryptjs')

async function generateCredentials() {
  // Generate secure random password (12 chars, letters + numbers)
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const password = generatePassword()
  console.log('Generated password:', password)

  // Hash password with bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log('\nBcrypt hash:', hashedPassword)

  console.log('\n=== SQL TO RUN ===')
  console.log(`
INSERT INTO users (email, name, password, role, level, stripe_subscription_id, stripe_price_id, created_at, updated_at)
VALUES (
  'freddienorwich@gmail.com',
  'Freddie Norwich',
  '${hashedPassword}',
  'member',
  'founding',
  'manual_subscription_freddie',
  'price_1SN63oIEGgnmE0KKEM0Ihkvt',
  NOW(),
  NOW()
);
  `)

  console.log('\n=== CREDENTIALS ===')
  console.log('Email: freddienorwich@gmail.com')
  console.log('Name: Freddie Norwich')
  console.log('Password:', password)
  console.log('Level: founding')
  console.log('Stripe Price ID: price_1SN63oIEGgnmE0KKEM0Ihkvt')
}

generateCredentials()
