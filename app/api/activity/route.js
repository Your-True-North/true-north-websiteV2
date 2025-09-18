// app/api/activity/route.ts
import { NextResponse } from 'next/server'
import { activityService } from '../lib/database.js'

export async function GET() {
  try {
    const activities = await activityService.getRecentActivities(20)
    return NextResponse.tson({ activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.tson(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}