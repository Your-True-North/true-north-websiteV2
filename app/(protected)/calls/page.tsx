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
  join_url?: string
  session_type?: string
  camera_note?: string
}

const ZOOM_MEETING_ID = '875 3611 9646'
const ZOOM_PASSCODE = '2121'

interface CalendarDay {
  date: Date
  hasCall: boolean
  callDetails?: {
    time: string
    title: string
    description: string
    googleCalendarUrl: string
    joinUrl?: string
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
  const [isEventsExpanded, setIsEventsExpanded] = useState(false)

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

  const stripHtml = (html: string) => {
    if (!html) return ''
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

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
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000)

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

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay()
    const days: CalendarDay[] = []

    for (let i = 0; i < startDayOfWeek; i++) {
      const date = new Date(year, month, -startDayOfWeek + i + 1)
      days.push({ date, hasCall: false })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)

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
            googleCalendarUrl: generateGoogleCalendarUrl(dayEvent),
            joinUrl: dayEvent.join_url
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
        background: 'var(--kyn-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--kyn-ink3)',
        fontFamily: 'var(--kyn-font-sans)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-sans)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px 14px 72px' : '28px 32px 52px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <Link
            href="/members"
            style={{
              color: 'var(--kyn-green)',
              textDecoration: 'none',
              fontSize: '13px',
              marginBottom: '12px',
              display: 'inline-block'
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--kyn-ink)',
            fontFamily: 'var(--kyn-font-serif)'
          }}>
            Live Calls Calendar
          </h1>
          <p style={{
            fontSize: isMobile ? '15px' : '13.5px',
            color: 'var(--kyn-ink2)',
            lineHeight: 1.6
          }}>
            One live session every Thursday at 8am London time. Come as you are, nothing here is gated.
          </p>
        </div>

        {/* Upcoming Events List */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              cursor: 'pointer',
              padding: '12px 16px',
              background: 'var(--kyn-surface)',
              borderRadius: 'var(--kyn-r-lg)',
              border: '1px solid var(--kyn-border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.15s ease'
            }}
            onClick={() => setIsEventsExpanded(!isEventsExpanded)}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
          >
            <h2 style={{
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: 600,
              color: 'var(--kyn-ink)',
              margin: 0,
              fontFamily: 'var(--kyn-font-serif)'
            }}>
              Upcoming Sessions {calendarEvents.length > 0 && `(${calendarEvents.filter(e => new Date(e.date) >= new Date()).length})`}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--kyn-green)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>
                {isEventsExpanded ? 'Collapse' : 'Expand'}
              </span>
              <svg
                style={{
                  width: '16px',
                  height: '16px',
                  transform: isEventsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {calendarEvents.length === 0 ? (
            <div style={{
              padding: '28px',
              background: 'var(--kyn-surface)',
              border: '1px solid var(--kyn-border)',
              borderRadius: 'var(--kyn-r-lg)',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
              <p style={{ fontSize: '13.5px', color: 'var(--kyn-ink3)' }}>
                No upcoming sessions scheduled yet. Check back soon!
              </p>
            </div>
          ) : (
            <>
              {/* Compact View */}
              {!isEventsExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {calendarEvents.slice(0, 5).map((event, idx) => {
                    const eventDate = new Date(event.date)
                    const isUpcoming = eventDate >= new Date()
                    if (!isUpcoming) return null

                    const month = eventDate.toLocaleDateString('en-US', { month: 'short' })
                    const day = eventDate.getDate()
                    const time = eventDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '11px 16px',
                          background: 'var(--kyn-surface)',
                          border: '1px solid var(--kyn-border)',
                          borderLeft: '3px solid var(--kyn-green)',
                          borderRadius: 'var(--kyn-r-lg)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'box-shadow 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => { window.open(generateGoogleCalendarUrl(event), '_blank') }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          minWidth: isMobile ? '70px' : '110px'
                        }}>
                          <div style={{ fontSize: isMobile ? '14px' : '13px', fontWeight: 600, color: 'var(--kyn-green)' }}>
                            {month} {day}
                          </div>
                          <div style={{ fontSize: isMobile ? '12px' : '11.5px', color: 'var(--kyn-ink3)' }}>
                            {time}
                          </div>
                        </div>
                        <div style={{ flex: 1, fontSize: isMobile ? '14.5px' : '13.5px', fontWeight: 600, color: 'var(--kyn-ink)' }}>
                          {event.title}
                        </div>
                        <svg style={{ width: '14px', height: '14px', color: 'var(--kyn-ink3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Expanded View */}
              {isEventsExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {calendarEvents.slice(0, 5).map((event, idx) => {
                    const eventDate = new Date(event.date)
                    const isUpcoming = eventDate >= new Date()
                    if (!isUpcoming) return null

                    const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'short' })
                    const month = eventDate.toLocaleDateString('en-US', { month: 'short' })
                    const day = eventDate.getDate()
                    const year = eventDate.getFullYear()
                    const time = eventDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: isMobile ? '14px' : '20px',
                          padding: isMobile ? '16px' : '18px 20px',
                          background: 'var(--kyn-surface)',
                          border: '1px solid var(--kyn-border)',
                          borderLeft: '3px solid var(--kyn-green)',
                          borderRadius: 'var(--kyn-r-lg)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'box-shadow 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => { window.open(generateGoogleCalendarUrl(event), '_blank') }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                      >
                        {/* Date Badge */}
                        <div style={{
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: isMobile ? '100%' : '88px',
                          padding: '12px',
                          background: 'var(--kyn-green-bg)',
                          border: '1px solid var(--kyn-border-green)',
                          borderRadius: 'var(--kyn-r)'
                        }}>
                          <div style={{
                            fontSize: isMobile ? '11px' : '9.5px',
                            fontWeight: 700,
                            color: 'var(--kyn-green)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.11em',
                            marginBottom: '3px'
                          }}>
                            {month}
                          </div>
                          <div style={{
                            fontSize: '28px',
                            fontWeight: 300,
                            color: 'var(--kyn-green)',
                            lineHeight: 1,
                            fontFamily: 'var(--kyn-font-serif)'
                          }}>
                            {day}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)', marginTop: '3px' }}>
                            {year}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h3 style={{
                              fontSize: isMobile ? '15px' : '16px',
                              fontWeight: 600,
                              color: 'var(--kyn-ink)',
                              margin: 0,
                              fontFamily: 'var(--kyn-font-serif)'
                            }}>
                              {event.title}
                            </h3>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 10px',
                              background: 'var(--kyn-green-bg)',
                              border: '1px solid var(--kyn-border-green)',
                              borderRadius: 'var(--kyn-r)',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: 'var(--kyn-green)'
                            }}>
                              <span>🕒</span>
                              <span>{time}</span>
                            </div>
                          </div>

                          {event.description && (
                            <p style={{ fontSize: isMobile ? '15px' : '13px', color: 'var(--kyn-ink2)', lineHeight: 1.6, margin: 0 }}>
                              {stripHtml(event.description)}
                            </p>
                          )}

                          {event.join_url && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                              <a
                                href={event.join_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '6px 14px',
                                  background: 'var(--kyn-green)',
                                  color: '#fff',
                                  borderRadius: 'var(--kyn-r)',
                                  fontSize: '12.5px',
                                  fontWeight: 600,
                                  textDecoration: 'none'
                                }}
                              >
                                Join on Zoom
                              </a>
                              <span style={{ fontSize: '11.5px', color: 'var(--kyn-ink3)' }}>
                                Meeting ID {ZOOM_MEETING_ID} · Passcode {ZOOM_PASSCODE}
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: isMobile ? '12px' : '11.5px', color: 'var(--kyn-ink3)' }}>
                            <span>{dayOfWeek}</span>
                            <span>·</span>
                            <span style={{ color: 'var(--kyn-green)' }}>Click to add to calendar</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Monthly Calendar */}
        <div style={{
          padding: isMobile ? '18px' : '24px',
          background: 'var(--kyn-surface)',
          border: '1px solid var(--kyn-border)',
          borderRadius: 'var(--kyn-r-lg)',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: 400,
              color: 'var(--kyn-ink)',
              margin: 0,
              fontFamily: 'var(--kyn-font-serif)'
            }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={goToPreviousMonth}
                style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid var(--kyn-border-mid)',
                  borderRadius: 'var(--kyn-r)',
                  color: 'var(--kyn-ink2)',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                ←
              </button>
              <button
                onClick={goToNextMonth}
                style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid var(--kyn-border-mid)',
                  borderRadius: 'var(--kyn-r)',
                  color: 'var(--kyn-ink2)',
                  cursor: 'pointer',
                  fontSize: '13px'
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
            gap: isMobile ? '3px' : '6px'
          }}>
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} style={{
                padding: isMobile ? '7px 3px' : '10px 6px',
                textAlign: 'center',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 600,
                color: 'var(--kyn-ink3)',
                borderBottom: '1px solid var(--kyn-border)'
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
                    padding: isMobile ? '6px 3px' : '12px 6px',
                    background: day.hasCall ? 'var(--kyn-green-bg)' : 'transparent',
                    border: isToday
                      ? '2px solid var(--kyn-green)'
                      : '1px solid var(--kyn-border)',
                    borderRadius: 'var(--kyn-r)',
                    textAlign: 'center',
                    opacity: isCurrentMonth ? 1 : 0.3,
                    cursor: day.hasCall ? 'pointer' : 'default',
                    position: 'relative',
                    minHeight: isMobile ? '36px' : '70px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    transition: 'box-shadow 0.15s ease'
                  }}
                  onClick={() => {
                    if (day.hasCall && day.callDetails) {
                      window.open(day.callDetails.googleCalendarUrl, '_blank')
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (day.hasCall) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    if (day.hasCall) e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: isToday ? 700 : 400,
                    color: day.hasCall ? 'var(--kyn-green)' : 'var(--kyn-ink2)',
                    marginBottom: isMobile ? '1px' : '3px'
                  }}>
                    {day.date.getDate()}
                  </div>
                  {day.hasCall && !isMobile && (
                    <div style={{ fontSize: '10px', color: 'var(--kyn-green)', fontWeight: 500 }}>
                      {day.callDetails?.time}
                    </div>
                  )}
                  {day.hasCall && (
                    <div style={{ fontSize: isMobile ? '8px' : '11px', color: 'var(--kyn-green)', marginTop: '1px' }}>
                      📞
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{
            marginTop: '18px',
            padding: '12px 14px',
            background: 'var(--kyn-green-bg)',
            borderRadius: 'var(--kyn-r)',
            border: '1px solid var(--kyn-border-green)'
          }}>
            <p style={{ fontSize: '13px', color: 'var(--kyn-ink2)', margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--kyn-green)' }}>One live call a week, same time, same room.</strong> Click on a date to add it to your calendar.
            </p>
          </div>
        </div>

        {/* Call Replays Section */}
        <div id="replays">
          <h2 style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 400,
            marginBottom: '18px',
            color: 'var(--kyn-ink)',
            fontFamily: 'var(--kyn-font-serif)'
          }}>
            Call Replays
          </h2>

          {replays.length === 0 ? (
            <div style={{
              padding: '28px',
              background: 'var(--kyn-surface)',
              border: '1px solid var(--kyn-border)',
              borderRadius: 'var(--kyn-r-lg)',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎥</div>
              <p style={{ fontSize: '13.5px', color: 'var(--kyn-ink3)' }}>
                No replays available yet. Join your first live call and replays will appear here.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '11px'
            }}>
              {replays.map(video => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    background: 'var(--kyn-surface)',
                    border: '1px solid var(--kyn-border)',
                    borderRadius: 'var(--kyn-r-lg)',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.15s ease',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                  >
                    {/* Video Thumbnail */}
                    <div style={{
                      width: '100%',
                      paddingTop: '56.25%',
                      background: video.youtubeId
                        ? `url(https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg)`
                        : 'var(--kyn-surface-raised)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      borderRadius: 'var(--kyn-r-lg) var(--kyn-r-lg) 0 0',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'var(--kyn-green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}>
                        <svg style={{ width: '22px', height: '22px', color: '#fff', marginLeft: '3px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>

                      {video.duration && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          padding: '3px 7px',
                          background: 'rgba(0,0,0,0.75)',
                          borderRadius: 'var(--kyn-r)',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#fff'
                        }}>
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div style={{ padding: '14px 16px' }}>
                      <h3 style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        marginBottom: '6px',
                        color: 'var(--kyn-ink)',
                        lineHeight: 1.4
                      }}>
                        {video.title}
                      </h3>
                      <p style={{
                        fontSize: '12.5px',
                        color: 'var(--kyn-ink2)',
                        lineHeight: 1.6,
                        marginBottom: '10px'
                      }}>
                        {video.description?.substring(0, 120)}{video.description?.length > 120 ? '...' : ''}
                      </p>
                      <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>
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
