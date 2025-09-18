// app/api/activity/route.js
import { NextResponse } from 'next/server'
import { activityService } from '../../../lib/database'

export async function GET() {
  try {
    const activities = await activityService.getRecentActivities(20)
    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}