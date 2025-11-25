import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('[Calendar] Webhook disabled for testing')
  return NextResponse.json({ received: true, disabled: true })
}

export async function GET() {
  return NextResponse.json({ status: 'disabled' })
}
