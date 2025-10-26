'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

const mockVideos = [
  {
    id: 1,
    title: "The Foundation of True Self",
    duration: "25 min",
    uploadDate: "3 days ago",
    category: "Foundation Work",
    description: "Essential understanding of who you really are beneath the conditioning.",
    youtubeId: "dQw4w9WgXcQ",
    comments: 24,
    likes: 156
  },
  {
    id: 2,
    title: "Releasing Childhood Patterns",
    duration: "32 min",
    uploadDate: "1 week ago",
    category: "Foundation Work",
    description: "How to identify and release patterns formed in childhood.",
    youtubeId: "dQw4w9WgXcQ",
    comments: 18,
    likes: 203
  },
  {
    id: 3,
    title: "Conscious Connected Breathing",
    duration: "45 min",
    uploadDate: "2 days ago",
    category: "Breathwork Sessions",
    description: "A guided breathwork session for deep emotional release.",
    youtubeId: "dQw4w9WgXcQ",
    comments: 31,
    likes: 187
  },
  {
    id: 4,
    title: "Energy Clearing Meditation",
    duration: "28 min",
    uploadDate: "5 days ago",
    category: "Energy Healing",
    description: "Clear stagnant energy and align with your true vibration.",
    youtubeId: "dQw4w9WgXcQ",
    comments: 22,
    likes: 164
  },
  {
    id: 5,
    title: "Daily Integration Practices",
    duration: "18 min",
    uploadDate: "1 week ago",
    category: "Integration Practices",
    description: "Simple practices to integrate your insights into daily life.",
    youtubeId: "dQw4w9WgXcQ",
    comments: 15,
    likes: 128
  }
]

const mockCategories = [
  { name: "Foundation Work", icon: "🎯", count: 12, color: "#9bc4b8" },
  { name: "Breathwork Sessions", icon: "🌊", count: 8, color: "#7fb069" },
  { name: "Energy Healing", icon: "⚡", count: 15, color: "#6a994e" },
  { name: "Integration Practices", icon: "🔥", count: 6, color: "#8db4a8" }
]

const mockActivity = [
  { user: "Marcus R.", action: "commented on \"The Foundation of True Self\"", time: "2 hours ago" },
  { user: "Sarah K.", action: "started discussion: \"Integration challenges\"", time: "4 hours ago" },
  { user: "David L.", action: "leveled up to \"Seeker\"", time: "1 day ago" },
  { user: "Emma W.", action: "shared breakthrough in \"Energy Healing\"", time: "2 days ago" }
]

export default function JourneyPage() {
  const [user, setUser] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [videoLikes, setVideoLikes] = useState({})
  const [videoComments, setVideoComments] = useState({})
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // More aggressive delay for Chrome - check multiple times if needed
    const checkAuth = () => {
      // Check if we just logged in
      const justLoggedIn = localStorage.getItem('justLoggedIn')

      if (justLoggedIn === 'true') {
        // Clear the flag
        localStorage.removeItem('justLoggedIn')
        // Wait longer after fresh login for Chrome to settle
        logger.debug('Journey', 'Fresh login detected, waiting for Chrome...')
        setTimeout(() => {
          const savedUser = localStorage.getItem('user')
          if (!savedUser) {
            logger.debug('Journey', 'Still no user after wait, redirecting to login')
            window.location.replace('/auth/login')
            return
          }
          loadUserData(savedUser)
        }, 150)
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

    const loadUserData = (savedUser: string) => {
      try {
        const parsedUser = JSON.parse(savedUser)

        // Verify user has valid session
        if (!parsedUser.email || !parsedUser.id) {
          logger.debug('Journey', 'Invalid user data, redirecting to login')
          localStorage.removeItem('user')
          window.location.replace('/auth/login')
          return
        }

        logger.debug('Journey', 'User authenticated', parsedUser.email)
        setUser(parsedUser)
      } catch (err) {
        console.error('[Journey] Failed to parse user data:', err)
        localStorage.removeItem('user')
        window.location.replace('/auth/login')
        return
      }

      // Load likes and comments from localStorage
      try {
        const savedLikes = localStorage.getItem('videoLikes')
        const savedComments = localStorage.getItem('videoComments')
        if (savedLikes) setVideoLikes(JSON.parse(savedLikes))
        if (savedComments) setVideoComments(JSON.parse(savedComments))
      } catch (err) {
        console.error('[Journey] Failed to load user data:', err)
      }
    }

    // Initial delay for Chrome
    setTimeout(checkAuth, 100)
  }, [])

  const handleLogout = () => {
    logger.debug('Journey', 'Logging out user')
    localStorage.removeItem('user')
    localStorage.removeItem('videoLikes')
    localStorage.removeItem('videoComments')
    localStorage.removeItem('justLoggedIn')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    window.location.replace('/')
  }

  const handleLikeVideo = (videoId) => {
    const newLikes = { ...videoLikes }
    if (newLikes[videoId]) {
      delete newLikes[videoId]
    } else {
      newLikes[videoId] = true
    }
    setVideoLikes(newLikes)
    localStorage.setItem('videoLikes', JSON.stringify(newLikes))
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
    const baseLikes = mockVideos.find(v => v.id === videoId)?.likes || 0
    return baseLikes + (videoLikes[videoId] ? 1 : 0)
  }

  const getVideoCommentsCount = (videoId) => {
    const baseComments = mockVideos.find(v => v.id === videoId)?.comments || 0
    const userComments = videoComments[videoId]?.length || 0
    return baseComments + userComments
  }

  const filteredVideos = selectedCategory === "All" 
    ? mockVideos 
    : mockVideos.filter(video => video.category === selectedCategory)

  const currentLevel = { name: "Seeker", color: "#9bc4b8" }
  const nextLevelDays = 45

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Loading your journey...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', paddingTop: '6rem' }}>
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
            <Link href="/members" style={{
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
              Dashboard
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
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10rem 1rem 2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
          gap: '1.5rem',
        }}>
          
          {/* Left Sidebar */}
          <div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(20px)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem',
              position: isMobile ? 'relative' : 'sticky',
              top: isMobile ? 'auto' : '6rem'
            }}>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  marginBottom: '1rem' 
                }}>Categories</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: selectedCategory === "All" ? 'rgba(155, 196, 184, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: selectedCategory === "All" ? '1px solid rgba(155, 196, 184, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                      color: selectedCategory === "All" ? '#9bc4b8' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      background: 'linear-gradient(45deg, #9bc4b8, #7fb069)', 
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#000'
                    }}>∀</div>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: '0.9rem' }}>All Videos</span>
                    <span style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem' 
                    }}>{mockVideos.length}</span>
                  </button>
                  
                  {mockCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: selectedCategory === category.name ? 'rgba(155, 196, 184, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: selectedCategory === category.name ? '1px solid rgba(155, 196, 184, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        color: selectedCategory === category.name ? '#9bc4b8' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: `linear-gradient(45deg, ${category.color}, #7fb069)`,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>{category.icon}</div>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: '0.85rem' }}>{category.name}</span>
                      <span style={{ 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem' 
                      }}>{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  marginBottom: '1rem' 
                }}>Your Progress</h3>
                <div style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: `linear-gradient(45deg, ${currentLevel.color}15, ${currentLevel.color}08)`,
                  border: `1px solid ${currentLevel.color}40`
                }}>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#000',
                    background: `linear-gradient(45deg, ${currentLevel.color}, #7fb069)`,
                    marginBottom: '0.5rem'
                  }}>
                    Level 2 - {currentLevel.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    Next level: {nextLevelDays} days
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(20px)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}>
              
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {selectedCategory === "All" ? "All Videos" : selectedCategory}
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                  {selectedCategory === "All" 
                    ? "Your complete transformation journey" 
                    : `${filteredVideos.length} videos in this category`}
                </p>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem' 
                }}>
                  {filteredVideos.map((video) => (
                    <div 
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(155, 196, 184, 0.3)'
                        e.currentTarget.style.transform = 'translateY(-4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{
                        height: '12rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.1), rgba(127, 176, 105, 0.1))'
                      }}>
                        <div style={{
                          width: '3rem',
                          height: '3rem',
                          background: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          paddingLeft: '3px'
                        }}>▶</div>
                      </div>
                      
                      <div style={{ padding: '1rem' }}>
                        <h3 style={{ 
                          fontWeight: 600, 
                          marginBottom: '0.5rem', 
                          fontSize: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>{video.title}</h3>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem', 
                          color: 'rgba(255, 255, 255, 0.6)', 
                          fontSize: '0.85rem', 
                          marginBottom: '0.75rem',
                          flexWrap: 'wrap'
                        }}>
                          <span>{video.duration}</span>
                          <span>•</span>
                          <span>{video.uploadDate}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.85rem'
                          }}>
                            <span>💬</span>
                            <span>{getVideoCommentsCount(video.id)}</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.85rem'
                          }}>
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

            {/* Community Activity - Mobile */}
            {isMobile && (
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                backdropFilter: 'blur(20px)', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                padding: '1.5rem',
                marginTop: '1.5rem'
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Community Activity</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {mockActivity.map((activity, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: '1rem', 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        borderRadius: '8px', 
                        borderLeft: '2px solid rgba(155, 196, 184, 0.4)' 
                      }}
                    >
                      <div style={{ color: '#9bc4b8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        {activity.user}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {activity.action}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                        {activity.time}
                      </div>
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
                background: 'rgba(255, 255, 255, 0.03)', 
                backdropFilter: 'blur(20px)', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                padding: '1.5rem',
                position: 'sticky',
                top: '6rem'
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Community Activity</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {mockActivity.map((activity, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: '1rem', 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        borderRadius: '8px', 
                        borderLeft: '2px solid rgba(155, 196, 184, 0.4)' 
                      }}
                    >
                      <div style={{ color: '#9bc4b8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        {activity.user}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {activity.action}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                        {activity.time}
                      </div>
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
            background: 'rgba(0, 0, 0, 0.8)', 
            backdropFilter: 'blur(4px)', 
            zIndex: 50, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
          }}
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            style={{ 
              background: '#0a0a0b', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              maxWidth: '56rem', 
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
              <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 600, paddingRight: '1rem' }}>{selectedVideo.title}</h2>
              <button 
                onClick={() => setSelectedVideo(null)}
                style={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
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
            
            <div style={{ padding: '1.5rem' }}>
              {/* YouTube Player */}
              <div style={{
                width: '100%',
                paddingBottom: '56.25%',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '1.5rem'
              }}>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <span>{selectedVideo.duration}</span>
                <span>•</span>
                <span>{selectedVideo.uploadDate}</span>
                <span>•</span>
                <span>{selectedVideo.category}</span>
              </div>

              <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1.5rem', fontSize: 'clamp(0.875rem, 2vw, 1rem)', lineHeight: 1.6 }}>
                {selectedVideo.description}
              </p>

              {/* Like Button */}
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  onClick={() => handleLikeVideo(selectedVideo.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: videoLikes[selectedVideo.id] ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: videoLikes[selectedVideo.id] ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: videoLikes[selectedVideo.id] ? '#ef4444' : '#fff',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!videoLikes[selectedVideo.id]) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!videoLikes[selectedVideo.id]) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>❤️</span>
                  <span>{videoLikes[selectedVideo.id] ? 'Liked' : 'Like'}</span>
                  <span>({getVideoLikesCount(selectedVideo.id)})</span>
                </button>
              </div>

              {/* Comments Section */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💬</span>
                  <span>Comments ({getVideoCommentsCount(selectedVideo.id)})</span>
                </h3>

                {/* Add Comment */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: '0.75rem'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(155, 196, 184, 0.3)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                  <button
                    onClick={() => handleAddComment(selectedVideo.id)}
                    disabled={!newComment.trim()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: newComment.trim() ? 'linear-gradient(135deg, #9bc4b8, #7fb069)' : 'rgba(255, 255, 255, 0.1)',
                      color: newComment.trim() ? '#000' : 'rgba(255, 255, 255, 0.3)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Post Comment
                  </button>
                </div>

                {/* Comments List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {videoComments[selectedVideo.id]?.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#000'
                        }}>
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9bc4b8' }}>
                            {comment.userName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            {new Date(comment.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                        {comment.text}
                      </p>
                    </div>
                  ))}
                  {!videoComments[selectedVideo.id] || videoComments[selectedVideo.id].length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                      <p>No comments yet. Be the first to share your thoughts!</p>
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