'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'


const mockCategories = [
  { name: "Foundation Work", icon: "🎯", count: 2, color: "#e67e22" },
  { name: "Somatic Work", icon: "🌊", count: 1, color: "#7fb069" },
  { name: "Live Teachings", icon: "⚡", count: 0, color: "#6a994e" },
  { name: "Integration Practices", icon: "🔥", count: 0, color: "#8db4a8" }
]

const mockActivity = [
  { user: "Marcus R.", action: "commented on \"The Beginning\"", time: "2 hours ago" },
  { user: "Sarah K.", action: "started discussion: \"Integration challenges\"", time: "4 hours ago" },
  { user: "David L.", action: "leveled up to \"Seeker\"", time: "1 day ago" },
  { user: "Emma W.", action: "shared breakthrough in \"Live Teachings\"", time: "2 days ago" }
]

export default function JourneyPage() {
  const [user, setUser] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [videoLikes, setVideoLikes] = useState<string[]>([])
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [videoComments, setVideoComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [videos, setVideos] = useState<any[]>([])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  useEffect(() => { setIsPlaying(false) }, [selectedVideo])

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/admin/videos")
        const data = await res.json()
        if (data.videos) {
          const formatted = data.videos.map((v: any) => ({
            ...v,
            youtubeId: v.youtubeId,
            duration: v.duration ? `${v.duration} min` : "N/A",
            uploadDate: v.uploadDate || v.uploaddate ? new Date(v.uploadDate || v.uploaddate).toLocaleDateString() : "N/A",
            comments: 0,
            likes: 0
          }))
          setVideos(formatted)

          const urlParams = new URLSearchParams(window.location.search)
          const videoId = urlParams.get('v')
          if (videoId) {
            const video = formatted.find((v: any) => v.id === videoId)
            if (video) setSelectedVideo(video)
          }
        }
      } catch (err) {
        console.error("Failed to fetch videos:", err)
      }
    }
    fetchVideos()
  }, [])

  useEffect(() => {
    const loadLikesFromDatabase = async (token: string) => {
      try {
        const res = await fetch('/api/reactions', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.likes) {
            setVideoLikes(Array.isArray(data.likes) ? data.likes : [])
          }
        }
      } catch (error) {
        console.error('Failed to load likes from database:', error)
      }
    }

    const checkAuth = async () => {
      const justLoggedIn = localStorage.getItem('justLoggedIn')

      if (justLoggedIn === 'true') {
        localStorage.removeItem('justLoggedIn')
        logger.debug('Journey', 'Fresh login detected, implementing ULTRA Chrome-safe loading...')

        for (let attempt = 0; attempt < 15; attempt++) {
          const waitTime = 200 + (attempt * 100)
          await new Promise(resolve => setTimeout(resolve, waitTime))

          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            logger.debug('Journey', `User data found on attempt ${attempt + 1} after ${waitTime}ms`)
            loadUserData(savedUser)
            return
          }

          logger.debug('Journey', `Attempt ${attempt + 1} failed, retrying in ${waitTime + 100}ms...`)
        }

        logger.debug('Journey', 'No user found after 15 attempts over ~11 seconds, redirecting to login')
        window.location.replace('/auth/login')
        return
      }

      const savedUser = localStorage.getItem('user')
      if (!savedUser) {
        logger.debug('Journey', 'No user found, redirecting to login')
        window.location.replace('/auth/login')
        return
      }

      loadUserData(savedUser)
    }

    const loadUserData = async (savedUser: string) => {
      try {
        const parsedUser = JSON.parse(savedUser)

        if (!parsedUser.email || !parsedUser.id) {
          logger.debug('Journey', 'Invalid user data, redirecting to login')
          localStorage.removeItem('user')
          window.location.replace('/auth/login')
          return
        }

        logger.debug('Journey', 'User authenticated', parsedUser.email)
        setUser(parsedUser)

        const token = localStorage.getItem('auth_token') || document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1]

        if (token) {
          setAuthToken(token)
          loadLikesFromDatabase(token)
        }
      } catch (err) {
        console.error('[Journey] Failed to parse user data:', err)
        localStorage.removeItem('user')
        window.location.replace('/auth/login')
        return
      }

      try {
        const savedComments = localStorage.getItem('videoComments')
        if (savedComments) setVideoComments(JSON.parse(savedComments))
      } catch (err) {
        console.error('[Journey] Failed to load comments:', err)
      }
    }

    setTimeout(() => checkAuth(), 300)
  }, [])

  const handleLogout = () => {
    logger.debug('Journey', 'Logging out user')
    console.log('[JOURNEY LOGOUT] Starting logout...')

    localStorage.removeItem('user')
    localStorage.removeItem('videoLikes')
    localStorage.removeItem('videoComments')
    localStorage.removeItem('justLoggedIn')
    localStorage.clear()

    sessionStorage.setItem('justLoggedOut', 'true')

    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

    console.log('[JOURNEY LOGOUT] Storage cleared, logout flag set')

    setTimeout(() => {
      console.log('[JOURNEY LOGOUT] Redirecting to homepage')
      window.location.replace('/')
    }, 50)
  }

  const handleLikeVideo = async (videoId) => {
    if (!user || !user.id) return

    const currentLikes = Array.isArray(videoLikes) ? videoLikes : []
    const newLikes = currentLikes.includes(videoId)
      ? currentLikes.filter(id => id !== videoId)
      : [...currentLikes, videoId]
    setVideoLikes(newLikes)
    localStorage.setItem('videoLikes', JSON.stringify(newLikes))

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, userId: user.id })
      })

      if (!res.ok) {
        console.error('Failed to save like to database')
        setVideoLikes(currentLikes)
        localStorage.setItem('videoLikes', JSON.stringify(currentLikes))
      }
    } catch (err) {
      console.error('Error saving like:', err)
    }
  }

  const handleAddComment = (videoId) => {
    if (!newComment.trim() || !user) return

    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      userName: user.name || user.email,
      timestamp: new Date().toISOString()
    }

    const newComments = { ...videoComments }
    if (!newComments[videoId]) {
      newComments[videoId] = []
    }
    newComments[videoId] = [comment, ...newComments[videoId]]

    setVideoComments(newComments)
    localStorage.setItem('videoComments', JSON.stringify(newComments))
    setNewComment('')
  }

  const getVideoLikesCount = (videoId) => {
    const baseLikes = videos.find(v => v.id === videoId)?.likes || 0
    return baseLikes + (Array.isArray(videoLikes) && videoLikes.includes(videoId) ? 1 : 0)
  }

  const getVideoCommentsCount = (videoId) => {
    const baseComments = videos.find(v => v.id === videoId)?.comments || 0
    const userComments = videoComments[videoId]?.length || 0
    return baseComments + userComments
  }

  const filteredVideos = selectedCategory === "All"
    ? videos
    : videos.filter(video => video.category === selectedCategory)

  const currentLevel = { name: "Seeker", color: "#e67e22" }
  const nextLevelDays = 45

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--kyn-ink3)', fontFamily: 'var(--kyn-font-sans)' }}>Loading your journey...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-sans)' }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px 14px 72px' : '28px 32px 52px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '260px 1fr',
          gap: '16px',
        }}>

          {/* Left Sidebar */}
          <div>
            <div style={{
              background: 'var(--kyn-surface)',
              borderRadius: 'var(--kyn-r-lg)',
              border: '1px solid var(--kyn-border)',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              position: isMobile ? 'relative' : 'sticky',
              top: isMobile ? 'auto' : '28px'
            }}>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: isMobile ? '11px' : '9.5px',
                  fontWeight: isMobile ? 700 : 600,
                  color: 'var(--kyn-ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.11em',
                  marginBottom: '12px'
                }}>Categories</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: 'var(--kyn-r)',
                      background: selectedCategory === "All" ? 'var(--kyn-green-bg)' : 'transparent',
                      border: selectedCategory === "All" ? '1px solid var(--kyn-border-green)' : '1px solid transparent',
                      color: selectedCategory === "All" ? 'var(--kyn-green)' : 'var(--kyn-ink2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      background: 'var(--kyn-green-bg)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--kyn-green)'
                    }}>∀</div>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: '13px' }}>All Videos</span>
                    <span style={{
                      background: 'var(--kyn-surface-raised)',
                      border: '1px solid var(--kyn-border)',
                      padding: '1px 7px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      color: 'var(--kyn-ink3)'
                    }}>{videos.length}</span>
                  </button>

                  {mockCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: 'var(--kyn-r)',
                        background: selectedCategory === category.name ? 'var(--kyn-green-bg)' : 'transparent',
                        border: selectedCategory === category.name ? '1px solid var(--kyn-border-green)' : '1px solid transparent',
                        color: selectedCategory === category.name ? 'var(--kyn-green)' : 'var(--kyn-ink2)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        background: 'var(--kyn-green-bg)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px'
                      }}>{category.icon}</div>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: '13px' }}>{category.name}</span>
                      <span style={{
                        background: 'var(--kyn-surface-raised)',
                        border: '1px solid var(--kyn-border)',
                        padding: '1px 7px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        color: 'var(--kyn-ink3)'
                      }}>{videos.filter(v => v.category === category.name).length}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Journey progress widget */}
              <div style={{ background: 'var(--kyn-surface-raised)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r)', padding: '14px 14px 18px' }}>
                <div style={{ fontSize: isMobile ? '11px' : '9.5px', letterSpacing: '0.11em', color: 'var(--kyn-ink3)', marginBottom: '14px', fontWeight: isMobile ? 700 : 600, textTransform: 'uppercase' as const }}>Your Journey</div>
                {(() => {
                  const stages = ['Seeker', 'Explorer', 'Pathfinder', 'Guide']
                  const currentIndex = Math.max(0, stages.indexOf(user?.level || 'Seeker'))
                  const overallProgress = user?.progress ?? 0
                  const levelMin = currentIndex * 25
                  const levelProgress = currentIndex === 3 ? 100 : Math.max(0, Math.min(100, ((overallProgress - levelMin) / 25) * 100))
                  const fillPercent = Math.min(100, (currentIndex / 3) * 100 + (levelProgress / 3))

                  return (
                    <div style={{ position: 'relative', height: '48px' }}>
                      <div style={{ position: 'absolute', top: '7px', left: 0, right: 0, height: '1px', background: 'var(--kyn-border)' }} />
                      <div style={{ position: 'absolute', top: '7px', left: 0, height: '1px', width: `${fillPercent}%`, background: 'linear-gradient(90deg, var(--kyn-green), var(--kyn-green-hi))', transition: 'width 0.8s ease' }} />
                      {stages.map((stage, index) => {
                        const isCurrent = index === currentIndex
                        const isCompleted = index < currentIndex
                        const posPercent = (index / 3) * 100
                        const isFirst = index === 0
                        const isLast = index === 3
                        return (
                          <div key={stage} style={{ position: 'absolute', left: `${posPercent}%`, top: 0, transform: isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center' }}>
                            <div style={{
                              width: '12px', height: '12px', borderRadius: '50%',
                              background: isCompleted ? 'var(--kyn-green)' : isCurrent ? 'var(--kyn-surface)' : 'var(--kyn-surface-raised)',
                              border: `1.5px solid ${isCurrent || isCompleted ? 'var(--kyn-green)' : 'var(--kyn-border-mid)'}`,
                              boxShadow: isCurrent ? '0 0 0 3px var(--kyn-green-mid)' : 'none',
                              position: 'relative', zIndex: 1
                            }} />
                            <div style={{ marginTop: '8px', fontSize: '0.67rem', color: isCurrent || isCompleted ? 'var(--kyn-green)' : 'var(--kyn-ink3)', fontWeight: isCurrent ? 700 : 400, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{stage}</div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <div style={{
              background: 'var(--kyn-surface)',
              borderRadius: 'var(--kyn-r-lg)',
              border: '1px solid var(--kyn-border)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>

              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--kyn-border)' }}>
                <h1 style={{ fontSize: '22px', fontWeight: isMobile ? 700 : 400, marginBottom: '4px', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-serif)' }}>
                  {selectedCategory === "All" ? "All Videos" : selectedCategory}
                </h1>
                <p style={{ color: 'var(--kyn-ink2)', fontSize: isMobile ? '15px' : '13px' }}>
                  {selectedCategory === "All"
                    ? "Your complete transformation journey"
                    : `${filteredVideos.length} videos in this category`}
                </p>
                {selectedCategory === "Somatic Work" && (
                  <a href="https://yourtruenorth.me/Breathwork_Session_Preparation.pdf" download style={{ display: "inline-block", marginTop: "12px", padding: "7px 14px", background: "var(--kyn-green)", color: "#fff", borderRadius: "var(--kyn-r)", fontSize: "12.5px", fontWeight: 600, textDecoration: "none" }}>
                    Download Breathwork Preparation Guide
                  </a>
                )}
                {selectedCategory === "Integration Practices" && (
                  <a href="https://yourtruenorth.me/Integration_Journal.pdf" download style={{ display: "inline-block", marginTop: "12px", padding: "7px 14px", background: "var(--kyn-green)", color: "#fff", borderRadius: "var(--kyn-r)", fontSize: "12.5px", fontWeight: 600, textDecoration: "none" }}>
                    Download The Integration Journal
                  </a>
                )}
              </div>

              <div style={{ padding: '16px 18px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '11px'
                }}>
                  {filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => {
                        setSelectedVideo(video)
                        window.history.pushState({}, '', `/journey?v=${video.id}`)
                      }}
                      style={{
                        background: 'var(--kyn-surface-raised)',
                        borderRadius: 'var(--kyn-r-lg)',
                        border: '1px solid var(--kyn-border)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                    >
                      <div style={{
                        height: '160px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: `url(https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        borderRadius: 'var(--kyn-r-lg) var(--kyn-r-lg) 0 0',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          background: 'var(--kyn-green)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          paddingLeft: '3px'
                        }}>▶</div>
                      </div>

                      <div style={{ padding: '12px 14px' }}>
                        <h3 style={{
                          fontWeight: 600,
                          marginBottom: '5px',
                          fontSize: isMobile ? '14.5px' : '13.5px',
                          color: 'var(--kyn-ink)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>{video.title}</h3>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: 'var(--kyn-ink3)',
                          fontSize: isMobile ? '12px' : '11.5px',
                          marginBottom: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <span>{video.duration}</span>
                          <span>·</span>
                          <span>{video.uploadDate}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--kyn-ink3)', fontSize: '12px' }}>
                            <span>💬</span>
                            <span>{getVideoCommentsCount(video.id)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--kyn-ink3)', fontSize: '12px' }}>
                            <span>❤️</span>
                            <span>{getVideoLikesCount(video.id)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Community Activity */}
            {isMobile && (
              <div style={{
                background: 'var(--kyn-surface)',
                borderRadius: 'var(--kyn-r-lg)',
                border: '1px solid var(--kyn-border)',
                padding: '16px',
                marginTop: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-serif)' }}>Community Activity</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mockActivity.map((activity, index) => (
                    <div key={index} style={{
                      padding: '10px 12px',
                      background: 'var(--kyn-surface-raised)',
                      borderRadius: 'var(--kyn-r)',
                      border: '1px solid var(--kyn-border)',
                      borderLeft: '2px solid var(--kyn-border-green)'
                    }}>
                      <div style={{ color: 'var(--kyn-green)', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{activity.user}</div>
                      <div style={{ color: 'var(--kyn-ink2)', fontSize: '14px', marginBottom: '4px' }}>{activity.action}</div>
                      <div style={{ color: 'var(--kyn-ink3)', fontSize: '12px' }}>{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop Only */}
          {!isMobile && (
            <div style={{ gridColumn: '3 / 4' }}>
              <div style={{
                background: 'var(--kyn-surface)',
                borderRadius: 'var(--kyn-r-lg)',
                border: '1px solid var(--kyn-border)',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                position: 'sticky',
                top: '28px'
              }}>
                <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-serif)' }}>Community Activity</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mockActivity.map((activity, index) => (
                    <div key={index} style={{
                      padding: '10px 12px',
                      background: 'var(--kyn-surface-raised)',
                      borderRadius: 'var(--kyn-r)',
                      border: '1px solid var(--kyn-border)',
                      borderLeft: '2px solid var(--kyn-border-green)'
                    }}>
                      <div style={{ color: 'var(--kyn-green)', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{activity.user}</div>
                      <div style={{ color: 'var(--kyn-ink2)', fontSize: '14px', marginBottom: '4px' }}>{activity.action}</div>
                      <div style={{ color: 'var(--kyn-ink3)', fontSize: '12px' }}>{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => {
            setSelectedVideo(null)
            window.history.pushState({}, '', '/journey')
          }}
        >
          <div
            style={{
              background: 'var(--kyn-surface)',
              borderRadius: 'var(--kyn-r-lg)',
              border: '1px solid var(--kyn-border)',
              maxWidth: '56rem',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              borderBottom: '1px solid var(--kyn-border)'
            }}>
              <h2 style={{ fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 600, paddingRight: '1rem', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-serif)' }}>{selectedVideo.title}</h2>
              <button
                onClick={() => {
                  setSelectedVideo(null)
                  window.history.pushState({}, '', '/journey')
                }}
                style={{
                  color: 'var(--kyn-ink3)',
                  fontSize: '1.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  lineHeight: 1,
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '16px 18px' }}>
              {/* YouTube Player */}
              <div style={{
                width: '100%',
                paddingBottom: '56.25%',
                position: 'sticky',
                top: 0,
                borderRadius: 'var(--kyn-r-lg)',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div onClick={() => setIsPlaying(true)} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: "pointer", backgroundImage: `url(https://img.youtube.com/vi/${selectedVideo.youtubeId}/maxresdefault.jpg)`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--kyn-green)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                      <div style={{ width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: "22px solid white", marginLeft: "4px" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--kyn-ink3)',
                fontSize: '12px',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                <span>{selectedVideo.duration}</span>
                <span>·</span>
                <span>{selectedVideo.uploadDate}</span>
                <span>·</span>
                <span style={{ color: 'var(--kyn-green)', fontWeight: 600 }}>{selectedVideo.category}</span>
              </div>

              <p style={{ color: 'var(--kyn-ink2)', marginBottom: '16px', fontSize: '13.5px', lineHeight: 1.6 }}>
                {selectedVideo.description}
              </p>

              {/* Like Button */}
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--kyn-border)' }}>
                <button
                  onClick={() => handleLikeVideo(selectedVideo.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    background: videoLikes.includes(selectedVideo.id) ? 'rgba(239,68,68,0.08)' : 'transparent',
                    border: videoLikes.includes(selectedVideo.id) ? '1px solid rgba(239,68,68,0.25)' : '1px solid var(--kyn-border-mid)',
                    borderRadius: 'var(--kyn-r)',
                    color: videoLikes.includes(selectedVideo.id) ? '#ef4444' : 'var(--kyn-ink2)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>❤️</span>
                  <span>{videoLikes.includes(selectedVideo.id) ? 'Liked' : 'Like'}</span>
                  <span>({getVideoLikesCount(selectedVideo.id)})</span>
                </button>
              </div>

              {/* Comments Section */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-serif)' }}>
                  <span>💬</span>
                  <span>Comments ({getVideoCommentsCount(selectedVideo.id)})</span>
                </h3>

                {/* Add Comment */}
                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--kyn-surface-raised)',
                      border: '1px solid var(--kyn-border)',
                      borderRadius: 'var(--kyn-r)',
                      color: 'var(--kyn-ink)',
                      fontSize: '13.5px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--kyn-border-green)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--kyn-border)'}
                  />
                  <button
                    onClick={() => handleAddComment(selectedVideo.id)}
                    disabled={!newComment.trim()}
                    style={{
                      padding: '7px 16px',
                      background: newComment.trim() ? 'var(--kyn-green)' : 'var(--kyn-border)',
                      color: newComment.trim() ? '#fff' : 'var(--kyn-ink3)',
                      border: 'none',
                      borderRadius: 'var(--kyn-r)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s ease',
                      minHeight: '36px'
                    }}
                  >
                    Post Comment
                  </button>
                </div>

                {/* Comments List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {videoComments[selectedVideo.id]?.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--kyn-surface-raised)',
                        borderRadius: 'var(--kyn-r)',
                        border: '1px solid var(--kyn-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'var(--kyn-blue-bg)',
                          border: '1px solid var(--kyn-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--kyn-blue)',
                          fontFamily: 'var(--kyn-font-serif)'
                        }}>
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--kyn-ink)' }}>
                            {comment.userName}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>
                            {new Date(comment.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <p style={{ color: 'var(--kyn-ink2)', fontSize: '13px', lineHeight: 1.55 }}>
                        {comment.text}
                      </p>
                    </div>
                  ))}
                  {!videoComments[selectedVideo.id] || videoComments[selectedVideo.id].length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--kyn-ink3)', fontSize: '13px' }}>
                      No comments yet. Be the first to share your thoughts!
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
