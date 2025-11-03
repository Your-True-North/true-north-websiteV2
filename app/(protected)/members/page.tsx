'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/logger'

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

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      logger.debug('Members', 'No user found, redirecting to login')
      window.location.replace('/auth/login')
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
    } catch (err) {
      console.error('[Members] Failed to parse user data:', err)
      localStorage.removeItem('user')
      window.location.replace('/auth/login')
    }
  }, [router])

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
    sessionStorage.clear()

    // Delete auth_token cookie (now works because httpOnly is false)
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'

    console.log('[MEMBERS LOGOUT] Storage cleared, cookie deleted')
    console.log('[MEMBERS LOGOUT] Cookies after delete:', document.cookie)

    // Small delay to ensure everything is cleared
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 300 }}>Entering portal...</div>
      </div>
    )
  }

  if (!user) return null

  const getLevelProgress = () => {
    if (user.level === 'Guide') return 100
    const totalDays = user.level === 'Seeker' ? 30 : user.level === 'Explorer' ? 60 : 90
    const progress = ((totalDays - user.daysUntilNext) / totalDays) * 100
    return Math.max(0, Math.min(100, progress))
  }

  const levelStages = ['Seeker', 'Explorer', 'Pathfinder', 'Guide']
  const currentStageIndex = levelStages.indexOf(user.level)
  const levelColors: { [key: string]: string } = {
    'Seeker': '#9bc4b8',
    'Explorer': '#7fb069',
    'Pathfinder': '#6a994e',
    'Guide': '#8db4a8'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', paddingTop: '6rem' }}>
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

      {/* Navigation */}
      <nav style={{
        position: 'relative',
        zIndex: 20,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <Link href="/" style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}>
            TRUE NORTH
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/journey" style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 300,
              border: '1px solid rgba(155, 196, 184, 0.3)',
              borderRadius: '8px',
              color: '#9bc4b8',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(155, 196, 184, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.3)'
            }}>
              The Path
            </Link>
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 300,
                border: '1px solid rgba(155, 196, 184, 0.3)',
                borderRadius: '8px',
                background: 'transparent',
                color: '#9bc4b8',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(155, 196, 184, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.3)'
              }}
            >
              Profile Settings
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 300,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '80rem', margin: '0 auto', padding: '10rem 1.5rem 2rem' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              borderRadius: '50%',
              background: profilePhoto ? `url(${profilePhoto})` : `linear-gradient(135deg, ${levelColors[user.level]}20, ${levelColors[user.level]}10)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(20px)'
            }}>
              {!profilePhoto && (
                <svg style={{ width: '2.5rem', height: '2.5rem', color: 'rgba(255, 255, 255, 0.8)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.75rem)',
            fontWeight: 300,
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            Welcome back, <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{user.name}</span>
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 'clamp(1rem, 2vw, 1.125rem)', fontWeight: 300 }}>
            Your transformation journey continues
          </p>
        </div>

        {/* Journey Progress Card */}
        <div style={{
          marginBottom: '2rem',
          backdropFilter: 'blur(20px)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isTablet ? '1fr' : '1fr auto',
              alignItems: 'center',
              gap: '3rem',
              marginBottom: '2.5rem'
            }}>
              {/* Level Info */}
              <div style={{ textAlign: isTablet ? 'center' : 'left' }}>
                <div style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255, 255, 255, 0.4)',
                  marginBottom: '0.75rem',
                  fontWeight: 300
                }}>
                  YOUR JOURNEY
                </div>
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3rem)', fontWeight: 300, marginBottom: '1rem', color: levelColors[user.level] }}>
                  {user.level}
                </div>
                {user.nextLevel ? (
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 300 }}>
                    <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300 }}>{user.daysUntilNext}</span> days until {user.nextLevel}
                  </div>
                ) : (
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 300 }}>Journey complete</div>
                )}
              </div>

              {/* Circular Progress */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <svg style={{ width: '12rem', height: '12rem', transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    style={{ color: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={levelColors[user.level]}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - getLevelProgress() / 100)}
                    strokeLinecap="round"
                    style={{
                      transition: 'all 1s ease-out',
                      filter: `drop-shadow(0 0 8px ${levelColors[user.level]}80)`
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 300 }}>{Math.round(getLevelProgress())}%</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 300, marginTop: '0.25rem' }}>
                    Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Path */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '0.75rem'
            }}>
              {levelStages.map((stage, index) => {
                const isActive = index <= currentStageIndex
                const isCurrent = index === currentStageIndex
                
                return (
                  <div
                    key={stage}
                    style={{
                      position: 'relative',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      transition: 'all 0.5s ease',
                      background: isCurrent
                        ? 'rgba(255, 255, 255, 0.1)'
                        : isActive
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isCurrent
                        ? `2px solid ${levelColors[stage]}40`
                        : isActive
                        ? '1px solid rgba(255, 255, 255, 0.2)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      opacity: isActive ? 1 : 0.4
                    }}
                  >
                    <div style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      marginBottom: '0.75rem',
                      fontWeight: 300,
                      transition: 'color 0.3s ease',
                      color: isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.5)'
                    }}>
                      {stage.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        borderRadius: '50%',
                        transition: 'all 0.3s ease',
                        background: isCurrent
                          ? levelColors[stage]
                          : isActive
                          ? 'rgba(255, 255, 255, 0.6)'
                          : 'rgba(255, 255, 255, 0.2)',
                        boxShadow: isCurrent ? `0 0 20px ${levelColors[stage]}80` : 'none',
                        animation: isCurrent ? 'pulse 2s ease-in-out infinite' : 'none'
                      }}></div>
                    </div>
                    {isCurrent && (
                      <div style={{
                        position: 'absolute',
                        top: '-0.25rem',
                        right: '-0.25rem',
                        width: '0.5rem',
                        height: '0.5rem',
                        background: levelColors[stage],
                        borderRadius: '50%',
                        animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                      }}></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : 'repeat(2, 1fr)',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Circle Content */}
          <div style={{
            backdropFilter: 'blur(20px)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '2rem',
            transition: 'border 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 300 }}>Circle of Return</h3>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '2rem', fontWeight: 300, lineHeight: 1.6 }}>
              Exclusive transformational content and teachings
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Weekly Teaching Videos', 'Live Session Replays', 'Community Discussions'].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.25rem', fontWeight: 300 }}>
                        COMING SOON
                      </div>
                      <div style={{ fontWeight: 300, transition: 'color 0.3s ease' }}>{item}</div>
                    </div>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.2)', transition: 'color 0.3s ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            backdropFilter: 'blur(20px)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '2rem',
            transition: 'border 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 300 }}>Quick Access</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { title: 'My Journey', desc: 'Video library & practices', href: '/videos', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { title: 'Live Calls', desc: 'Join the community', href: '/calls', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                { title: 'Community', desc: 'Connect with others', href: '/forum', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#fff',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
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
                    <div style={{ fontWeight: 300, transition: 'color 0.3s ease' }}>{action.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 300 }}>{action.desc}</div>
                  </div>
                  <svg style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.2)', flexShrink: 0, transition: 'all 0.3s ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div style={{
          backdropFilter: 'blur(20px)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)', fontWeight: 300, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.5rem', fontWeight: 300 }}>
                EMAIL ADDRESS
              </div>
              <div style={{ fontWeight: 300, color: 'rgba(255, 255, 255, 0.9)' }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.5rem', fontWeight: 300 }}>
                MEMBER SINCE
              </div>
              <div style={{ fontWeight: 300, color: 'rgba(255, 255, 255, 0.9)' }}>
                {new Date(user.joinDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>
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
              background: '#0a0a0b',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
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
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 300, color: '#fff' }}>Profile Settings</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
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
                  border: '2px solid rgba(155, 196, 184, 0.3)',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {!profilePhoto && (
                    <svg style={{ width: '2.5rem', height: '2.5rem', color: 'rgba(255, 255, 255, 0.5)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: 'rgba(155, 196, 184, 0.1)',
                  border: '1px solid rgba(155, 196, 184, 0.3)',
                  borderRadius: '8px',
                  color: '#9bc4b8',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
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
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
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
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
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
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Bio */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Bio <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>(optional)</span>
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
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '0.25rem' }}>
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
                    color: '#000',
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
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)',
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