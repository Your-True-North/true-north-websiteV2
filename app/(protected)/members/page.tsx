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
      <div style={{ minHeight: '100vh', background: '#0f0f0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    <div style={{ minHeight: '100vh', background: '#0f0f0d', color: '#f0ede8', paddingTop: '2rem' }}>

      {/* Announcement popup */}
      {announcement && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div style={{
            background: '#1a1a18', borderRadius: '12px', maxWidth: '480px', width: '100%',
            padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', border: '1px solid #2c2c2a', position: 'relative'
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
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9bc4b8', marginBottom: '12px' }}>
              From Mason
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#f0ede8', marginBottom: '12px', lineHeight: 1.4 }}>
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
                  style={{ flex: 1, display: 'block', textAlign: 'center', padding: '12px', background: '#9bc4b8', color: '#0a0a0a', borderRadius: '6px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
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
      {/* Animated Background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '-12rem',
          width: isMobile ? '18rem' : '24rem',
          height: isMobile ? '18rem' : '24rem',
          background: 'radial-gradient(circle, rgba(155, 196, 184, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '-12rem',
          width: isMobile ? '18rem' : '24rem',
          height: isMobile ? '18rem' : '24rem',
          background: 'radial-gradient(circle, rgba(127, 176, 105, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'pulse 4s ease-in-out infinite 1s'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '80vw' : '600px',
          height: isMobile ? '80vw' : '600px',
          background: 'radial-gradient(circle, rgba(106, 153, 78, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          animation: 'pulse 4s ease-in-out infinite 2s'
        }}></div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem 2rem' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '1.5rem', position: 'relative' }}>
            <div
              onClick={() => setShowProfileModal(true)}
              style={{
                width: '5rem',
                height: '5rem',
                borderRadius: '50%',
                background: profilePhoto ? `url(${profilePhoto})` : `linear-gradient(135deg, ${levelColors[user.level]}20, ${levelColors[user.level]}10)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid #2c2c2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(20px)',
                cursor: 'pointer'
              }}
            >
              {!profilePhoto && (
                <svg style={{ width: '2.5rem', height: '2.5rem', color: '#555' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div
              onClick={() => setShowProfileModal(true)}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '50%',
                background: '#9bc4b8',
                border: '2px solid #0f0f0d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <svg style={{ width: '0.75rem', height: '0.75rem', color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536M9 11l6.364-6.364a2 2 0 112.828 2.828L11.828 13.828a4 4 0 01-1.414.707l-2.828.707.707-2.828a4 4 0 01.707-1.414z" />
              </svg>
            </div>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.75rem)',
            fontWeight: 300,
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            color: '#f0ede8'
          }}>
            <span style={{ color: 'rgba(240, 237, 232, 0.5)' }}>Welcome back,</span> <span style={{ color: '#f0ede8' }}>{user.name}</span>
          </h1>
          <p style={{ color: '#a0a09c', fontSize: 'clamp(1rem, 2vw, 1.125rem)', fontWeight: 300 }}>
            Your transformation journey continues
          </p>
        </div>

        {/* Journey Progress — horizontal timeline */}
        <div style={{ background: '#1a1a18', border: '1px solid #2c2c2a', borderRadius: '12px', padding: '1.25rem 1.5rem 1.75rem', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#555', fontWeight: 400, marginBottom: '4px' }}>YOUR JOURNEY</div>
            <div style={{ fontSize: '0.8rem', color: '#a0a09c', lineHeight: 1.5 }}>
              Track your progress here and compare it to your life elevation outside the Circle. As you move through the stages, notice where things shift.
            </div>
          </div>

          <div style={{ position: 'relative', height: '48px' }}>
            {/* Grey track */}
            <div style={{
              position: 'absolute',
              top: '9px',
              left: 0,
              right: 0,
              height: '2px',
              background: '#2c2c2a',
              borderRadius: '1px'
            }} />

            {/* Filled track */}
            <div style={{
              position: 'absolute',
              top: '9px',
              left: 0,
              height: '2px',
              width: `${Math.min(100, (currentStageIndex / 3) * 100 + (getLevelProgress() / 3))}%`,
              background: 'linear-gradient(90deg, #5a9e6e, #3d7a52)',
              borderRadius: '1px',
              transition: 'width 0.8s ease'
            }} />

            {/* Level dots */}
            {levelStages.map((stage, index) => {
              const isCurrent = index === currentStageIndex
              const isCompleted = index < currentStageIndex
              const posPercent = (index / 3) * 100
              const isFirst = index === 0
              const isLast = index === 3

              return (
                <div key={stage} style={{
                  position: 'absolute',
                  left: `${posPercent}%`,
                  top: 0,
                  transform: isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center'
                }}>
                  {/* Dot */}
                  <div className={isCurrent ? 'journey-pulse-dot' : ''} style={{
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    background: isCurrent ? '#4a9e5c' : isCompleted ? '#4a9e5c' : '#252523',
                    border: `2px solid ${isCurrent || isCompleted ? '#4a9e5c' : '#3a3a38'}`,
                    position: 'relative',
                    zIndex: 1
                  }} />

                  {/* Label */}
                  <div style={{
                    marginTop: '8px',
                    fontSize: '0.68rem',
                    color: isCurrent ? '#f0ede8' : isCompleted ? '#4a9e5c' : '#444',
                    fontWeight: isCurrent ? 600 : 400,
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.02em'
                  }}>
                    {stage}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            backdropFilter: 'blur(20px)',
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            padding: '2rem',
            transition: 'border 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3a3a38'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2c2c2a'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '1.5rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: '#252523',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 300, color: '#f0ede8' }}>Quick Access</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { title: 'Teachings', desc: 'Browse full video library & guided practices', href: '/videos', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { title: 'Weekly Teaching Videos', desc: 'Latest teachings & spiritual guidance', href: '/videos?category=Live%20Teachings', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                { title: 'Live Session Replays', desc: 'Watch past community calls & sessions', href: '/replays', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { title: 'Live Call Calendar', desc: 'View upcoming sessions & add to calendar', href: '/calls', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { title: 'Community', desc: 'Connect with fellow members', href: '/community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#141412',
                    border: '1px solid #2c2c2a',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#f0ede8',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1e1e1c'
                    e.currentTarget.style.borderColor = '#9bc4b8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#141412'
                    e.currentTarget.style.borderColor = '#2c2c2a'
                  }}
                >
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    background: '#252523',
                    border: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s ease'
                  }}>
                    <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 300, transition: 'color 0.3s ease', color: '#f0ede8' }}>{action.title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: 300 }}>{action.desc}</div>
                  </div>
                  <svg style={{ width: '1.25rem', height: '1.25rem', color: '#555', flexShrink: 0, transition: 'all 0.3s ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <NextSessionCard />
        {/* Progress Stats */}
        <div style={{
          marginBottom: '2rem',
          backdropFilter: 'blur(20px)',
          background: '#1a1a18',
          border: '1px solid #2c2c2a',
          borderRadius: '12px',
          padding: '2rem',
          transition: 'border 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3a3a38'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2c2c2a'}>
          <h3 style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            fontWeight: 300,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            color: '#f0ede8'
          }}>
Your Progress
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr' : 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(155, 196, 184, 0.05)',
              border: '1px solid #2c2c2a',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#9bc4b8', marginBottom: '0.5rem' }}>
                {stats.videosWatched || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: 300 }}>
                Videos Watched
              </div>
            </div>
            
            <div style={{
              padding: '1.5rem',
              background: 'rgba(127, 176, 105, 0.05)',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#7fb069', marginBottom: '0.5rem' }}>
                {Math.round((stats.totalWatchTime || 0) / 60)}m
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: 300 }}>
                Watch Time
              </div>
            </div>
            
            <div style={{
              padding: '1.5rem',
              background: 'rgba(106, 153, 78, 0.05)',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#6a994e', marginBottom: '0.5rem' }}>
                {stats.completionRate || 0}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: 300 }}>
                Completion Rate
              </div>
            </div>
          </div>
        </div>


        {/* Account Info */}
        <div style={{
          backdropFilter: 'blur(20px)',
          background: '#1a1a18',
          border: '1px solid #2c2c2a',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)', fontWeight: 300, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0', color: '#f0ede8' }}>
            <svg style={{ width: '1.25rem', height: '1.25rem', color: '#555' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Details
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr' : 'repeat(2, 1fr)',
            gap: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: '#555', marginBottom: '0.5rem', fontWeight: 300 }}>
                EMAIL ADDRESS
              </div>
              <div style={{ fontWeight: 300, color: '#f0ede8' }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: '#555', marginBottom: '0.5rem', fontWeight: 300 }}>
                MEMBER SINCE
              </div>
              <div style={{ fontWeight: 300, color: '#f0ede8' }}>
                {new Date(user.joinDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #2c2c2a' }}>
            <button
              onClick={handleManageBilling}
              disabled={billingLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#252523',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#a0a09c',
                fontSize: '0.875rem',
                fontWeight: 400,
                cursor: billingLoading ? 'not-allowed' : 'pointer',
                opacity: billingLoading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { if (!billingLoading) e.currentTarget.style.borderColor = '#9bc4b8' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333' }}
            >
              {billingLoading ? 'Loading...' : 'Manage payment details'}
            </button>
            {billingError && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#ef4444' }}>{billingError}</p>
            )}
          </div>
        </div>
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
              background: '#1a1a18',
              borderRadius: '12px',
              border: '1px solid #2c2c2a',
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
              borderBottom: '1px solid #2c2c2a'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 300, color: '#f0ede8' }}>Profile Settings</h2>
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
                  border: '2px solid #9bc4b8',
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
                  border: '1px solid #9bc4b8',
                  borderRadius: '8px',
                  color: '#9bc4b8',
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
                    color: '#f0ede8',
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
                    color: '#f0ede8',
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
                    color: '#f0ede8',
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
                    background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                    color: '#0f0f0d',
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

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}} />
    </div>
  )
}