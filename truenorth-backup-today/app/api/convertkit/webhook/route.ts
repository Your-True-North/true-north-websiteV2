import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const data = await request.json()
  
  if (data.event === 'subscriber.unsubscribe') {
    const email = data.subscriber.email_address
    console.log(`Removing access for: ${email}`)
  }
  
  return NextResponse.json({ received: true })
}
