const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const prisma = new PrismaClient()

const members = [
  { name: 'Dean Pooley', email: 'deanpooley72@outlook.com' }
]

async function addMember(member) {
  const password = crypto.randomBytes(8).toString('hex')
  const hashedPassword = await bcrypt.hash(password, 10)
  
  await prisma.user.create({
    data: {
      email: member.email,
      name: member.name,
      password: hashedPassword,
      role: 'member',
      level: 'founding',
      isActive: true
    }
  })
  
  console.log(`${member.name}: ${password}`)
  
  // Add to ConvertKit
  await fetch(`https://api.convertkit.com/v3/tags/${process.env.MEMBERSHIP_TAG_ID}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.CONVERTKIT_API_KEY,
      email: member.email,
      first_name: member.name.split(' ')[0]
    })
  })
}

async function main() {
  for (const member of members) {
    await addMember(member)
  }
  await prisma.$disconnect()
}

main()
