'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import NextSessionCard from '../../components/calendar/NextSessionCard'
import PushNotificationPrompt from '../../components/PushNotificationPrompt'
import InstallAppBanner from '../../components/InstallAppBanner'

interface User {
  id: number
  email: string
  name: string
  role: string
  level: string
  daysUntilNext: number
  nextLevel: string | null
  joinDate: string
}

export default function MembersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', bio: '' })
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [billingLoading, setBillingLoading] = useState(false)
  const [billingError, setBillingError] = useState('')
  const [stats, setStats] = useState({ videosWatched: 0, totalWatchTime: 0, completionRate: 0 })
  const [announcement, setAnnouncement] = useState<{ id: number; title: string; body: string; url: string } | null>(null)

  useEffect(() => {
    fetch('/api/announcements/latest')
      .then(res => res.json())
      .then(data => {
        if (!data.announcement) return
        const dismissed = localStorage.getItem('dismissed_announcement')
        if (dismissed !== String(data.announcement.id)) {
          setAnnouncement(data.announcement)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      logger.debug('Members', 'No user found, redirecting to login')
      window.location.replace('/auth/login')
      return
    }

    // Check if coming from logout
    const params = new URLSearchParams(window.location.search)
    if (params.get("logout") === "true") {
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace("/auth/login")
      return
    }
    try {
      const parsedUser = JSON.parse(userData)

      // Verify user has valid session
      if (!parsedUser.email || !parsedUser.id) {
        logger.debug('Members', 'Invalid user data, redirecting to login')
        localStorage.removeItem('user')
        window.location.replace('/auth/login')
        return
      }

      logger.debug('Members', 'User authenticated', parsedUser.email)
      setUser(parsedUser)
      setProfileForm({ name: parsedUser.name, email: parsedUser.email, bio: parsedUser.bio || '' })
      if (parsedUser.profile_photo) {
        setProfilePhoto(parsedUser.profile_photo)
      }
      setLoading(false)

      // Fetch stats
      fetch('/api/user/stats', {
        headers: { 'x-user-id': parsedUser.id.toString() }
      })
        .then(res => res.json())
        .then(data => {
          if (data.stats) {
            setStats(data.stats)
          }
        })
        .catch(err => console.error('Failed to fetch stats:', err))

      // Fetch real progress and level
      fetch('/api/progress/calculate', {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${document.cookie.match(/auth_token=([^;]+)/)?.[1]}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.level) {
            const updatedUser = {
              ...parsedUser,
              level: data.level,
              nextLevel: data.nextLevel,
              daysUntilNext: data.daysUntilNext,
              progress: data.progress
            }
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))
          }
        })
        .catch(err => console.error('Failed to fetch progress:', err))
    } catch (err) {
      console.error('[Members] Failed to parse user data:', err)
      localStorage.removeItem('user')
      window.location.replace('/auth/login')
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logger.debug('Members', 'Logging out user')
    console.log('[MEMBERS LOGOUT] Starting logout...')

    // Clear all auth data
    localStorage.removeItem('user')
    localStorage.removeItem('videoLikes')
    localStorage.removeItem('videoComments')
    localStorage.removeItem('justLoggedIn')
    localStorage.clear()

    // Set logout flag BEFORE clearing sessionStorage
    sessionStorage.setItem('justLoggedOut', 'true')

    // Delete auth_token cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

    console.log('[MEMBERS LOGOUT] Storage cleared, logout flag set')

    // Redirect to homepage
    setTimeout(() => {
      console.log('[MEMBERS LOGOUT] Redirecting to homepage')
      router.push('/')
    }, 50)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    setSaving(true)

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user?.id,
          name: profileForm.name,
          email: profileForm.email,
          photo: profilePhoto,
          bio: profileForm.bio
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setProfileError(data.error || 'Failed to update profile')
        setSaving(false)
        return
      }

      // Update local storage with all user data from server
      const updatedUser = {
        ...user,
        name: data.user.name,
        email: data.user.email,
        profile_photo: data.user.profile_photo,
        bio: data.user.bio,
        level: data.user.level,
        progress: data.user.progress
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setProfileSuccess('Profile updated successfully!')
      setSaving(false)

      setTimeout(() => {
        setShowProfileModal(false)
        setProfileSuccess('')
      }, 2000)
    } catch (err) {
      console.error('[Profile Update] Error:', err)
      setProfileError('Something went wrong. Try again.')
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setProfileError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image must be less than 5MB')
      return
    }

    try {
      // Compress and resize image
      const imageCompression = (await import('browser-image-compression')).default

      const options = {
        maxSizeMB: 0.5,              // Max 500KB after compression
        maxWidthOrHeight: 500,        // Max 500x500px
        useWebWorker: true,
        fileType: 'image/jpeg'
      }

      const compressedFile = await imageCompression(file, options)

      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string)
        setProfileError('')
      }
      reader.readAsDataURL(compressedFile)

    } catch (error) {
      console.error('Error compressing image:', error)
      setProfileError('Failed to process image. Please try another.')
    }
  }

  const handleManageBilling = async () => {
    setBillingLoading(true)
    setBillingError('')
    try {
      const token = document.cookie.match(/auth_token=([^;]+)/)?.[1]
      const res = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setBillingError(data.error || 'Could not open billing portal. Please contact support.')
      }
    } catch {
      setBillingError('Something went wrong. Please try again.')
    } finally {
      setBillingLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--kyn-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666', fontWeight: 300 }}>Entering portal...</div>
      </div>
    )
  }

  if (!user) return null

  const getLevelProgress = () => {
    if (user.level === 'Guide') return 100
    const overallProgress = user.progress ?? 0
    const levelMin = user.level === 'Seeker' ? 0 : user.level === 'Explorer' ? 25 : 50
    const levelMax = levelMin + 25
    return Math.max(0, Math.min(100, ((overallProgress - levelMin) / (levelMax - levelMin)) * 100))
  }

  const levelStages = ['Seeker', 'Explorer', 'Pathfinder', 'Guide']
  const currentStageIndex = Math.max(0, levelStages.indexOf(user.level))
  const levelColors: { [key: string]: string } = {
    'Seeker': '#e67e22',
    'Explorer': '#7fb069',
    'Pathfinder': '#6a994e',
    'Guide': '#8db4a8'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--kyn-bg)',
      color: 'var(--kyn-ink)',
      fontFamily: 'var(--kyn-font-sans)'
    }}>

      {/* Announcement popup */}
      {announcement && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--kyn-sidebar2)', borderRadius: '12px', maxWidth: '480px', width: '100%',
            padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', border: '1px solid var(--kyn-border)', position: 'relative'
          }}>
            <button
              onClick={() => {
                localStorage.setItem('dismissed_announcement', String(announcement.id))
                setAnnouncement(null)
              }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.25rem', color: '#aaa', cursor: 'pointer', lineHeight: 1 }}
            >
              ×
            </button>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--kyn-green-hi)', marginBottom: '12px' }}>
              From Mason
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--kyn-ink)', marginBottom: '12px', lineHeight: 1.4 }}>
              {announcement.title}
            </h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#a0a09c', marginBottom: '1.5rem' }}>
              {announcement.body}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {announcement.url && announcement.url !== '/members' && (
                <a
                  href={announcement.url}
                  onClick={() => {
                    localStorage.setItem('dismissed_announcement', String(announcement.id))
                    setAnnouncement(null)
                  }}
                  style={{ flex: 1, display: 'block', textAlign: 'center', padding: '12px', background: 'var(--kyn-green-hi)', color: '#0a0a0a', borderRadius: '6px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                >
                  View Now
                </a>
              )}
              <button
                onClick={() => {
                  localStorage.setItem('dismissed_announcement', String(announcement.id))
                  setAnnouncement(null)
                }}
                style={{ flex: 1, padding: '12px', background: '#252523', border: '1px solid #333', borderRadius: '6px', color: '#888', fontSize: '14px', cursor: 'pointer' }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
        <InstallAppBanner />
        <PushNotificationPrompt userId={user?.id} />
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '16px 14px 72px' : '28px 32px 52px'
      }}>

        {/* TOPBAR */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '18px',
          paddingBottom: '17px',
          borderBottom: '1px solid var(--kyn-border)'
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--kyn-font-serif)',
              fontSize: isMobile ? '18px' : '22px',
              fontWeight: 400,
              color: 'var(--kyn-ink)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}>
              Welcome back,{' '}
              <span style={{ color: 'var(--kyn-green)' }}>{user.name}</span>
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--kyn-ink3)',
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              Keep going. The path reveals itself.
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'var(--kyn-surface)',
            border: '1px solid var(--kyn-border)',
            borderRadius: '20px',
            fontSize: '12px',
            color: 'var(--kyn-ink2)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            <div style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#4aad6a',
              animation: 'breathe 2.4s ease-in-out infinite'
            }} />
            Next call Thursday
          </div>
        </div>

        {/* ANNOUNCEMENT BANNER — inline, not modal */}
        {announcement && (
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            borderRadius: 'var(--kyn-r-lg)',
            marginBottom: '16px',
            overflow: 'hidden',
            background: '#1e2d26',
            border: '1px solid rgba(82,183,136,0.18)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.14)'
          }}>
            <div style={{
              width: '3px',
              background: 'linear-gradient(180deg, var(--kyn-green-hi), var(--kyn-green))',
              flexShrink: 0
            }} />
            <div style={{ padding: '13px 16px', flex: 1 }}>
              <div style={{
                fontSize: '9.5px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--kyn-green-hi)',
                marginBottom: '4px'
              }}>
                From True North
              </div>
              <div style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.55,
                fontWeight: 300
              }}>
                {announcement.body}
              </div>
              {announcement.url && announcement.url !== '/members' && (
                <a
                  href={announcement.url}
                  onClick={() => {
                    localStorage.setItem('dismissed_announcement', String(announcement.id))
                    setAnnouncement(null)
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginTop: '10px',
                    padding: '6px 13px',
                    background: 'rgba(82,183,136,0.14)',
                    border: '1px solid rgba(82,183,136,0.28)',
                    borderRadius: 'var(--kyn-r)',
                    color: 'var(--kyn-green-hi)',
                    fontSize: '11.5px',
                    textDecoration: 'none'
                  }}>
                  Book your spot
                </a>
              )}
            </div>
            <button
              onClick={() => {
                localStorage.setItem('dismissed_announcement', String(announcement.id))
                setAnnouncement(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.22)',
                fontSize: '15px',
                cursor: 'pointer',
                padding: '12px 14px',
                alignSelf: 'flex-start'
              }}>
              ×
            </button>
          </div>
        )}

        {/* BENTO ROW 1 — Journey + Next Session */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1fr',
          gap: '11px',
          marginBottom: '18px'
        }}>

          {/* Journey card */}
          <div style={{
            background: 'var(--kyn-surface)',
            borderRadius: 'var(--kyn-r-lg)',
            padding: '18px 22px 20px',
            boxShadow: '0 0 0 1px var(--kyn-border), 0 2px 6px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              fontSize: '9.5px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--kyn-ink3)',
              marginBottom: '4px'
            }}>
              Your Dedication Path
            </div>
            <div style={{
              fontSize: '11.5px',
              color: 'var(--kyn-ink3)',
              marginBottom: '14px',
              fontStyle: 'italic'
            }}>
              The work only counts when you show up for it.
            </div>

            <div style={{ position: 'relative', height: '46px' }}>
              {/* Track background */}
              <div style={{
                position: 'absolute',
                top: '7px', left: 0, right: 0,
                height: '1px',
                background: 'var(--kyn-border)'
              }} />
              {/* Track fill */}
              <div style={{
                position: 'absolute',
                top: '7px', left: 0,
                height: '1px',
                width: `${Math.min(100, (levelStages.indexOf(user.level) / 3) * 100 + (getLevelProgress() / 3))}%`,
                background: 'linear-gradient(90deg, var(--kyn-green), var(--kyn-green-hi))',
                transition: 'width 0.8s ease'
              }} />
              {/* Stage dots */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {levelStages.map((stage, index) => {
                  const currentIndex = levelStages.indexOf(user.level)
                  const isCompleted = index < currentIndex
                  const isCurrent = index === currentIndex
                  const isFirst = index === 0
                  const isLast = index === levelStages.length - 1
                  return (
                    <div key={stage} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isCompleted ? 'var(--kyn-green)' : 'var(--kyn-surface)',
                        border: `1.5px solid ${isCompleted || isCurrent ? 'var(--kyn-green)' : 'var(--kyn-border-mid)'}`,
                        boxShadow: isCurrent ? '0 0 0 3px var(--kyn-green-mid)' : 'none',
                        position: 'relative',
                        zIndex: 1
                      }} />
                      <div style={{
                        fontSize: '10px',
                        color: isCompleted || isCurrent ? 'var(--kyn-green)' : 'var(--kyn-ink3)',
                        fontWeight: isCurrent ? 600 : 400,
                        whiteSpace: 'nowrap'
                      }}>
                        {stage}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stats merged into journey card */}
            <div style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid var(--kyn-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {[
                { label: 'Videos watched', value: stats.videosWatched || 0, accent: 'var(--kyn-green)' },
                { label: 'Watch time', value: `${Math.round((stats.totalWatchTime || 0) / 60)}m`, accent: 'var(--kyn-ink2)' },
                { label: 'Completion', value: `${stats.completionRate || 0}%`, accent: 'var(--kyn-green-hi)' }
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--kyn-ink3)', marginBottom: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '-0.02em', color: stat.accent, lineHeight: 1 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Session card */}
          <div style={{
            borderRadius: 'var(--kyn-r-lg)',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              height: '3px',
              flexShrink: 0,
              background: 'linear-gradient(90deg, var(--kyn-green), var(--kyn-green-hi), transparent)'
            }} />
            <div style={{
              background: 'var(--kyn-sidebar2)',
              flex: 1,
              minHeight: '120px'
            }}>
              <NextSessionCard />
            </div>
          </div>

        </div>

        {/* LOWER GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.45fr 1fr',
          gap: '11px'
        }}>

          {/* Spaces panel */}
          <div style={{
            background: 'var(--kyn-surface)',
            border: '1px solid var(--kyn-border)',
            borderRadius: 'var(--kyn-r-lg)',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              padding: '12px 17px',
              borderBottom: '1px solid var(--kyn-border)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--kyn-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              Spaces
              <a href="/community" style={{
                fontSize: '11px',
                color: 'var(--kyn-green)',
                textDecoration: 'none'
              }}>
                View all
              </a>
            </div>
            {[
              {
                name: 'Brotherhood',
                desc: 'Discussion · questions · wins',
                href: '/community',
                badge: '3 new',
                badgeColor: 'var(--kyn-blue)',
                badgeBg: 'var(--kyn-blue-bg)'
              },
              {
                name: 'Teachings',
                desc: 'Video library · guided practices',
                href: '/videos',
                badge: null,
                badgeColor: '',
                badgeBg: ''
              },
              {
                name: 'Session Replays',
                desc: 'Past calls · recordings',
                href: '/replays',
                badge: '1 new',
                badgeColor: 'var(--kyn-green)',
                badgeBg: 'var(--kyn-green-bg)'
              },
              {
                name: 'Resources',
                desc: 'Guides · practices · tools',
                href: '/resources',
                badge: null,
                badgeColor: '',
                badgeBg: ''
              }
            ].map((space, i, arr) => (
              <a
                key={i}
                href={space.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 17px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--kyn-border)' : 'none',
                  textDecoration: 'none',
                  background: 'transparent',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--kyn-surface-raised)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: 'var(--kyn-ink)' }}>{space.name}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--kyn-ink3)', marginTop: '1px' }}>{space.desc}</div>
                </div>
                {space.badge && (
                  <span style={{
                    padding: '2px 7px',
                    background: space.badgeBg,
                    color: space.badgeColor,
                    borderRadius: '8px',
                    fontSize: '9.5px',
                    fontWeight: 700
                  }}>
                    {space.badge}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>

            {/* Active now */}
            <div style={{
              background: 'var(--kyn-surface)',
              border: '1px solid var(--kyn-border)',
              borderRadius: 'var(--kyn-r-lg)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                padding: '12px 17px 10px',
                borderBottom: '1px solid var(--kyn-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '7px'
              }}>
                <div style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#4aad6a',
                  animation: 'breathe 2.5s ease-in-out infinite',
                  flexShrink: 0
                }} />
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--kyn-ink)'
                }}>
                  Active now
                </div>
                <div style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  color: 'var(--kyn-blue)',
                  fontWeight: 500
                }}>
                  7 online
                </div>
              </div>
              <div style={{
                padding: '12px 17px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {['JK', 'MT', 'AL', 'RB', 'DS'].map((initials, i) => (
                  <div key={i} style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--kyn-blue-bg)',
                    border: '2px solid var(--kyn-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: 'var(--kyn-blue)',
                    marginLeft: i === 0 ? 0 : '-6px'
                  }}>
                    {initials}
                  </div>
                ))}
                <div style={{
                  fontSize: '11.5px',
                  color: 'var(--kyn-ink3)',
                  marginLeft: '7px'
                }}>
                  brothers online
                </div>
              </div>
            </div>

            {/* Account */}
            <div style={{
              background: 'var(--kyn-surface)',
              border: '1px solid var(--kyn-border)',
              borderRadius: 'var(--kyn-r-lg)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                padding: '12px 17px',
                borderBottom: '1px solid var(--kyn-border)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--kyn-ink)'
              }}>
                Account
              </div>
              <div style={{ padding: '0 17px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--kyn-border)',
                  fontSize: '12.5px'
                }}>
                  <span style={{ color: 'var(--kyn-ink3)' }}>Email</span>
                  <span style={{ color: 'var(--kyn-ink)' }}>{user.email}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--kyn-border)',
                  fontSize: '12.5px'
                }}>
                  <span style={{ color: 'var(--kyn-ink3)' }}>Member since</span>
                  <span style={{ color: 'var(--kyn-ink)' }}>
                    {new Date(user.joinDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  fontSize: '12.5px'
                }}>
                  <span style={{ color: 'var(--kyn-ink3)' }}>Billing</span>
                  <button
                    onClick={handleManageBilling}
                    disabled={billingLoading}
                    style={{
                      padding: '5px 11px',
                      background: 'transparent',
                      border: '1px solid var(--kyn-border-mid)',
                      borderRadius: 'var(--kyn-r)',
                      color: 'var(--kyn-ink2)',
                      fontSize: '11.5px',
                      cursor: billingLoading ? 'not-allowed' : 'pointer',
                      opacity: billingLoading ? 0.6 : 1
                    }}>
                    {billingLoading ? 'Loading...' : 'Manage'}
                  </button>
                </div>
                {billingError && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    paddingBottom: '9px'
                  }}>
                    {billingError}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes breathe {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `}} />

      </div>

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            style={{
              background: 'var(--kyn-sidebar2)',
              borderRadius: '12px',
              border: '1px solid var(--kyn-border)',
              maxWidth: '32rem',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderBottom: '1px solid var(--kyn-border)'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--kyn-ink)' }}>Profile Settings</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  color: '#888',
                  fontSize: '1.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} style={{ padding: '1.5rem' }}>
              {/* Profile Photo */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '6rem',
                  height: '6rem',
                  borderRadius: '50%',
                  background: profilePhoto ? `url(${profilePhoto})` : 'linear-gradient(135deg, rgba(155, 196, 184, 0.2), rgba(127, 176, 105, 0.1))',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid var(--kyn-green-hi)',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {!profilePhoto && (
                    <svg style={{ width: '2.5rem', height: '2.5rem', color: '#555' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid var(--kyn-green-hi)',
                  borderRadius: '8px',
                  color: 'var(--kyn-green-hi)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem', fontWeight: 300 }}>
                  Square image recommended · Min 200×200px · Max 5MB
                </div>
              </div>

              {profileError && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{profileError}</p>
                </div>
              )}

              {profileSuccess && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(127, 176, 105, 0.1)',
                  border: '1px solid rgba(127, 176, 105, 0.2)',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{ color: '#7fb069', fontSize: '0.875rem' }}>{profileSuccess}</p>
                </div>
              )}

              {/* Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#a0a09c', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#252523',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'var(--kyn-ink)',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#a0a09c', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#252523',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'var(--kyn-ink)',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Bio */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#a0a09c', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Bio <span style={{ color: '#555' }}>(optional)</span>
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  disabled={saving}
                  placeholder="Share a bit about your journey..."
                  maxLength={500}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#252523',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'var(--kyn-ink)',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#555', marginTop: '0.25rem' }}>
                  {profileForm.bio.length}/500
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, var(--kyn-green-hi), var(--kyn-green))',
                    color: 'var(--kyn-sidebar)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  disabled={saving}
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: 'transparent',
                    border: '1px solid #333',
                    color: '#888',
                    fontWeight: 500,
                    fontSize: '1rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
