'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Video {
  id: number
  title: string
  description: string
  youtube_url: string
  youtubeId: string
  category: string
  duration: string
  upload_date: string
}

interface CalendarEvent {
  title: string
  date: string
  description: string
}

interface CalendarDay {
  date: Date
  hasCall: boolean
  callDetails?: {
    time: string
    title: string
    description: string
    googleCalendarUrl: string
  }
}

export default function CallsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [replays, setReplays] = useState<Video[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/login')
      return
    }
    fetchReplays()
    fetchCalendarEvents()
  }, [router])

  useEffect(() => {
    if (calendarEvents.length > 0) {
      generateCalendar()
      setLoading(false)
    }
  }, [currentMonth, calendarEvents])

  const fetchReplays = async () => {
    try {
      const res = await fetch('/api/videos?category=Live Teachings')
      const data = await res.json()

      if (res.ok && data.videos) {
        setReplays(data.videos)
      }
    } catch (error) {
      console.error('Error fetching replays:', error)
    }
  }

  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch('/api/calendar/events')
      const data = await res.json()

      if (res.ok && data.events) {
        setCalendarEvents(data.events)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      setLoading(false)
    }
  }

  const generateGoogleCalendarUrl = (event: CalendarEvent) => {
    const eventDate = new Date(event.date)
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours later

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const title = encodeURIComponent(event.title)
    const description = encodeURIComponent(event.description || 'Circle of Return Live Call')
    const startDate = formatDate(eventDate)
    const endDateFormatted = formatDate(endDate)

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${startDate}/${endDateFormatted}`
  }

  const generateCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Get first day of month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Get day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay()

    // Create array of calendar days
    const days: CalendarDay[] = []

    // Add empty days for previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = new Date(year, month, -startDayOfWeek + i + 1)
      days.push({ date, hasCall: false })
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)

      // Check if there's a calendar event on this day
      const dayEvent = calendarEvents.find(event => {
        const eventDate = new Date(event.date)
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        )
      })

      if (dayEvent) {
        const eventDate = new Date(dayEvent.date)
        days.push({
          date,
          hasCall: true,
          callDetails: {
            time: eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
            title: dayEvent.title,
            description: dayEvent.description,
            googleCalendarUrl: generateGoogleCalendarUrl(dayEvent)
          }
        })
      } else {
        days.push({ date, hasCall: false })
      }
    }

    setCalendarDays(days)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '20px 16px' : '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/members"
            style={{
              color: '#9bc4b8',
              textDecoration: 'none',
              fontSize: '14px',
              marginBottom: '12px',
              display: 'inline-block'
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            Live Calls Calendar
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            Join monthly live sessions with True and guest experts
          </p>
        </div>

        {/* Monthly Calendar */}
        <div style={{
          padding: isMobile ? '24px' : '32px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 600,
              color: '#9bc4b8',
              margin: 0
            }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={goToPreviousMonth}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  color: '#9bc4b8',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ←
              </button>
              <button
                onClick={goToNextMonth}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  color: '#9bc4b8',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: isMobile ? '4px' : '8px'
          }}>
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} style={{
                padding: isMobile ? '8px 4px' : '12px 8px',
                textAlign: 'center',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.5)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {isMobile ? day.charAt(0) : day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth()
              const isToday =
                day.date.getDate() === new Date().getDate() &&
                day.date.getMonth() === new Date().getMonth() &&
                day.date.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={idx}
                  style={{
                    padding: isMobile ? '8px 4px' : '16px 8px',
                    background: day.hasCall
                      ? 'linear-gradient(135deg, rgba(155, 196, 184, 0.2), rgba(127, 176, 105, 0.2))'
                      : 'transparent',
                    border: isToday
                      ? '2px solid #9bc4b8'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '3px',
                    textAlign: 'center',
                    opacity: isCurrentMonth ? 1 : 0.3,
                    cursor: day.hasCall ? 'pointer' : 'default',
                    position: 'relative',
                    minHeight: isMobile ? '40px' : '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    if (day.hasCall && day.callDetails) {
                      window.open(day.callDetails.googleCalendarUrl, '_blank')
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (day.hasCall) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155, 196, 184, 0.3), rgba(127, 176, 105, 0.3))'
                      e.currentTarget.style.transform = 'scale(1.02)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (day.hasCall) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155, 196, 184, 0.2), rgba(127, 176, 105, 0.2))'
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                >
                  <div style={{
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: isToday ? 600 : 400,
                    color: day.hasCall ? '#9bc4b8' : 'rgba(255, 255, 255, 0.7)',
                    marginBottom: isMobile ? '2px' : '4px'
                  }}>
                    {day.date.getDate()}
                  </div>
                  {day.hasCall && !isMobile && (
                    <div style={{
                      fontSize: '10px',
                      color: '#7fb069',
                      fontWeight: 500
                    }}>
                      {day.callDetails?.time}
                    </div>
                  )}
                  {day.hasCall && (
                    <div style={{
                      fontSize: isMobile ? '8px' : '11px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginTop: '2px'
                    }}>
                      📞
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(155, 196, 184, 0.1)',
            borderRadius: '3px',
            border: '1px solid rgba(155, 196, 184, 0.2)'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              lineHeight: 1.5
            }}>
              <strong style={{ color: '#9bc4b8' }}>Live calls are synced from Google Calendar.</strong> Click on a date with a call to add it to your calendar.
            </p>
          </div>
        </div>

        {/* Call Replays Section */}
        <div id="replays">
          <h2 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 600,
            marginBottom: '24px',
            color: '#9bc4b8'
          }}>
            Call Replays
          </h2>

          {replays.length === 0 ? (
            <div style={{
              padding: '32px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🎥
              </div>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                No replays available yet. Join your first live call and replays will appear here.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {replays.map(video => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  >
                    {/* Video Thumbnail */}
                    <div style={{
                      width: '100%',
                      paddingTop: '56.25%',
                      background: video.youtubeId
                        ? `url(https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg)`
                        : 'rgba(0, 0, 0, 0.5)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      {/* Play Button Overlay */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                      }}>
                        <svg style={{ width: '32px', height: '32px', color: '#000', marginLeft: '4px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>

                      {/* Duration Badge */}
                      {video.duration && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          padding: '4px 8px',
                          background: 'rgba(0, 0, 0, 0.8)',
                          borderRadius: '3px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 500,
                        marginBottom: '8px',
                        color: '#fff',
                        lineHeight: 1.4
                      }}>
                        {video.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        lineHeight: 1.6,
                        marginBottom: '12px'
                      }}>
                        {video.description?.substring(0, 120)}{video.description?.length > 120 ? '...' : ''}
                      </p>
                      <div style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.4)'
                      }}>
                        {new Date(video.upload_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

