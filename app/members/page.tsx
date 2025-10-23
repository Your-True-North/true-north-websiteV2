'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      console.log('[Members] No user found, redirecting to login')
      window.location.replace('/auth/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)

      // Verify user has valid session
      if (!parsedUser.email || !parsedUser.id) {
        console.log('[Members] Invalid user data, redirecting to login')
        localStorage.removeItem('user')
        window.location.replace('/auth/login')
        return
      }

      console.log('[Members] User authenticated:', parsedUser.email)
      setUser(parsedUser)
    } catch (err) {
      console.error('[Members] Failed to parse user data:', err)
      localStorage.removeItem('user')
      window.location.replace('/auth/login')
    } finally {
      setLoading(false)
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
    console.log('[Members] Logging out user')
    localStorage.removeItem('user')
    localStorage.removeItem('videoLikes')
    localStorage.removeItem('videoComments')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    window.location.replace('/')
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
          width: '24rem',
          height: '24rem',
          background: 'radial-gradient(circle, rgba(155, 196, 184, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '-12rem',
          width: '24rem',
          height: '24rem',
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
          width: '600px',
          height: '600px',
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
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
              My Journey
            </Link>
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
              background: `linear-gradient(135deg, ${levelColors[user.level]}20, ${levelColors[user.level]}10)`,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(20px)'
            }}>
              <svg style={{ width: '2.5rem', height: '2.5rem', color: 'rgba(255, 255, 255, 0.8)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
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
                { title: 'Book a Session', desc: 'Schedule your breakthrough', href: '/work', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { title: 'Resource Library', desc: 'Transformation tools', href: '/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                { title: 'Get Support', desc: 'Reach out for guidance', href: '/contact', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }
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