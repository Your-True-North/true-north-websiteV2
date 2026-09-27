import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

// How many founding spots exist in total. Spots left = this minus the
// number of currently active subscriptions on the founding prices.
const FOUNDING_CAP = 50

async function countActiveSubscriptions(stripe: any, price: string): Promise<number> {
  let count = 0
  let startingAfter: string | undefined
  let hasMore = true
  while (hasMore) {
    const page = await stripe.subscriptions.list({
      price,
      status: 'active',
      limit: 100,
      starting_after: startingAfter,
    })
    count += page.data.length
    hasMore = page.has_more
    startingAfter = page.data[page.data.length - 1]?.id
  }
  return count
}

// Cached for 10 minutes via Next's data cache, so this doesn't hit Stripe on
// every page view. Returns null (never a guessed number) if the count can't
// be worked out reliably.
const getFoundingSpotsLeft = unstable_cache(
  async (): Promise<number | null> => {
    if (!process.env.STRIPE_SECRET_KEY) return null

    const priceIds = [process.env.STRIPE_CIRCLE_PRICE_ID, process.env.STRIPE_PRICE_YEARLY].filter(
      (id): id is string => Boolean(id)
    )
    if (priceIds.length === 0) return null

    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      let total = 0
      for (const price of priceIds) {
        total += await countActiveSubscriptions(stripe, price)
      }
      return Math.max(0, FOUNDING_CAP - total)
    } catch (error) {
      console.error('[founding-spots] Failed to count subscriptions:', error)
      return null
    }
  },
  ['founding-spots-left'],
  { revalidate: 600 }
)

export async function GET() {
  const spotsLeft = await getFoundingSpotsLeft()
  return NextResponse.json({ spotsLeft })
}
