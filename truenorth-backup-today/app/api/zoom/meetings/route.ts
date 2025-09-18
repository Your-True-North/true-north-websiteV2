import { NextResponse } from 'next/server'

async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID
  const clientId = process.env.ZOOM_CLIENT_ID
  const clientSecret = process.env.ZOOM_CLIENT_SECRET
  
  const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  
  const data = await response.json()
  return data.access_token
}

export async function POST(request: Request) {
  const { title, startTime, duration } = await request.json()
  
  try {
    const accessToken = await getZoomAccessToken()
    
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: title,
        type: 2,
        start_time: startTime,
        duration: duration,
        settings: {
          host_video: true,
          participant_video: false,
          waiting_room: true,
          auto_recording: 'cloud'
        }
      }),
    })

    const meetingData = await response.json()
    
    if (response.ok) {
      return NextResponse.json({
        meetingId: meetingData.id,
        joinUrl: meetingData.join_url,
        password: meetingData.password
      })
    } else {
      return NextResponse.json({ error: 'Failed to create meeting' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
