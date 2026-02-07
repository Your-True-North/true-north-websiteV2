'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  name: string
  email: string
  level?: string
  nextLevel?: string | null
  daysUntilNext?: number
}

interface Post {
  id: number
  title: string | null
  content: string
  category: string | null
  created_at: string
  user_name: string
  user_photo: string | null
  reply_count: number
  like_count: number
}

const navLinks = [
  { label: 'Journey', href: '/journey' },
  { label: 'Teachings', href: '/videos' },
  { label: 'Community', href: '/community' },
  { label: 'Calendar', href: '/calls' },
  { label: 'Dashboard', href: '/members' },
]

export default function CommunityPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showVideoCard, setShowVideoCard] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null)
  const [continueHovered, setContinueHovered] = useState(false)

  // Auth - same pattern as forum page
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/login')
      return
    }

    try {
      const parsed = JSON.parse(userData)
      setUser(parsed)
    } catch (err) {
      router.push('/auth/login')
    }
  }, [router])

  // Fetch posts - same pattern as forum page
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/forum/posts')
      const data = await res.json()

      if (res.ok) {
        setPosts(data.posts)
      }
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch posts:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch level data
  useEffect(() => {
    if (user) {
      fetch('/api/progress/calculate', {
        headers: { 'Authorization': `Bearer ${document.cookie.match(/auth_token=([^;]+)/)?.[1]}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.level) {
            setUser(prev => prev ? {
              ...prev,
              level: data.level,
              nextLevel: data.nextLevel,
              daysUntilNext: data.daysUntilNext
            } : null)
          }
        })
        .catch(err => console.error('Failed to fetch progress:', err))
    }
  }, [user?.id])

  // Time ago helper
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666' }}>Loading...</div>
      </div>
    )
  }

  const currentLevel = user?.level || 'Seeker'
  const nextLevel = user?.nextLevel || 'Explorer'

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Hero Section */}
      <div style={{
        background: '#545454',
        padding: '2rem 0',
        marginBottom: '3rem'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Internal Nav */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    color: link.label === 'Community' ? '#e67e22' : '#cccccc',
                    fontSize: '0.9375rem',
                    fontWeight: link.label === 'Community' ? 600 : 500,
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    borderBottom: link.label === 'Community' ? '2px solid #e67e22' : '2px solid transparent',
                    paddingBottom: '0.25rem'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              href="/members"
              style={{
                color: '#cccccc',
                fontSize: '0.875rem',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease'
              }}
            >
              {user?.name || 'Profile'}
            </Link>
          </nav>

          {/* Welcome + Level */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h1 style={{
              fontFamily: 'Gambarino, serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0
            }}>
              Welcome back, {user?.name}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.25rem'
              }}>
                {currentLevel}
              </span>
              {nextLevel && (
                <>
                  <span style={{ color: '#999', fontSize: '1rem' }}>→</span>
                  <span style={{
                    color: '#999999',
                    fontWeight: 400,
                    fontSize: '1rem'
                  }}>
                    {nextLevel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 1.5rem 3rem',
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Community Feed */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontFamily: 'Gambarino, serif',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#1a1a1a',
              margin: 0
            }}>
              Community Feed
            </h2>
            <Link
              href="/forum"
              style={{
                color: '#e67e22',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Go to Forum →
            </Link>
          </div>

          {/* Mobile Toggle */}
          {isMobile && (
            <button
              onClick={() => setShowVideoCard(!showVideoCard)}
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                background: '#e67e22',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}
            >
              Next Teaching
            </button>
          )}

          {/* Mobile Video Card (toggled) */}
          {isMobile && showVideoCard && (
            <div style={{
              background: '#f5f5f5',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '100%',
                height: '160px',
                background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                color: '#fff',
                marginBottom: '1rem'
              }}>▶</div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.15em',
                color: '#e67e22',
                marginBottom: '0.5rem'
              }}>
                Continue Your Journey
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1a1a1a',
                marginBottom: '0.75rem',
                margin: '0 0 0.75rem 0'
              }}>
                Understanding the Nervous System
              </h3>
              <Link
                href="/videos"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: '#333333',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                Continue →
              </Link>
            </div>
          )}

          {/* Posts List */}
          {posts.length === 0 ? (
            <div style={{
              background: '#ffffff',
              border: '2px solid #e5e5e5',
              borderRadius: '6px',
              padding: '3rem 2rem',
              textAlign: 'center'
            }}>
              <p style={{ color: '#666', marginBottom: '1rem', margin: '0 0 1rem 0' }}>No posts yet. Be the first to share!</p>
              <Link
                href="/forum"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: '#e67e22',
                  color: '#ffffff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                Create a Post
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/${post.id}`}
                  style={{
                    display: 'block',
                    background: '#ffffff',
                    border: `2px solid ${hoveredPostId === post.id ? '#666' : '#e5e5e5'}`,
                    borderRadius: '6px',
                    padding: '1.5rem',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseEnter={() => setHoveredPostId(post.id)}
                  onMouseLeave={() => setHoveredPostId(null)}
                >
                  {/* Post Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: post.user_photo ? `url(${post.user_photo})` : 'linear-gradient(135deg, #e67e22, #d35400)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      {!post.user_photo && post.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                        {post.user_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>
                        {getTimeAgo(post.created_at)}
                        {post.category && ` · ${post.category}`}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  {post.title && (
                    <h3 style={{
                      fontSize: '1.0625rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#e67e22',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {post.title}
                    </h3>
                  )}
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#333',
                    lineHeight: 1.6,
                    marginBottom: '0.75rem',
                    margin: '0 0 0.75rem 0'
                  }}>
                    {post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}
                  </p>

                  {/* Post Stats */}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: '#999' }}>
                    <span>{post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}</span>
                    <span>{post.like_count} {post.like_count === 1 ? 'like' : 'likes'}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Desktop only */}
        {!isMobile && (
          <aside style={{
            position: 'sticky',
            top: '2rem'
          }}>
            {/* Next Video Card */}
            <div style={{
              background: '#f5f5f5',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              padding: '1.5rem'
            }}>
              <div style={{
                width: '100%',
                height: '150px',
                background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                color: '#fff',
                marginBottom: '1rem'
              }}>▶</div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.15em',
                color: '#e67e22',
                marginBottom: '0.5rem'
              }}>
                Continue Your Journey
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1a1a1a',
                marginBottom: '0.75rem',
                margin: '0 0 0.75rem 0'
              }}>
                Understanding the Nervous System
              </h3>
              <Link
                href="/videos"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: continueHovered ? '#1a1a1a' : '#333333',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  textDecoration: 'none',
                  borderRadius: '4px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={() => setContinueHovered(true)}
                onMouseLeave={() => setContinueHovered(false)}
              >
                Continue →
              </Link>
            </div>

            {/* Quick Links */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #e5e5e5',
              borderRadius: '6px',
              padding: '1.5rem',
              marginTop: '1rem'
            }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                color: '#666',
                marginBottom: '1rem',
                margin: '0 0 1rem 0'
              }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/forum" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  Forum
                </Link>
                <Link href="/videos" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  Video Library
                </Link>
                <Link href="/calls" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0' }}>
                  Live Calls
                </Link>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
