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

const categories = [
  'Introductions',
  'Wins & Breakthroughs',
  'Questions & Support',
  'Integration Practices'
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

  // New post modal state - copied from forum page
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Introductions' })
  const [posting, setPosting] = useState(false)

  // Like tracking
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

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

  // Like handler - copied from forum [postId] page
  const handleLike = async (e: React.MouseEvent, postId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return

    try {
      const res = await fetch(`/api/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (res.ok) {
        const data = await res.json()
        setLikedPosts(prev => {
          const next = new Set(prev)
          if (data.liked) {
            next.add(postId)
          } else {
            next.delete(postId)
          }
          return next
        })
        // Refresh posts to get updated like counts
        fetchPosts()
      }
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  // Create post handler - copied from forum page
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setPosting(true)

    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          category: newPost.category,
          title: newPost.title || null,
          content: newPost.content
        })
      })

      const data = await res.json()

      if (res.ok) {
        setShowNewPostModal(false)
        setNewPost({ title: '', content: '', category: 'Introductions' })
        fetchPosts()
      } else {
        alert(data.error || 'Failed to create post')
      }
      setPosting(false)
    } catch (err) {
      console.error('Post error:', err)
      alert('Something went wrong')
      setPosting(false)
    }
  }

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
              color: '#1a1a1a',
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
                color: '#1a1a1a',
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
            <button
              onClick={() => setShowNewPostModal(true)}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#e67e22',
                border: 'none',
                borderRadius: '4px',
                color: '#1a1a1a',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + New Post
            </button>
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
                color: '#1a1a1a',
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
                color: '#1a1a1a',
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
                  color: '#1a1a1a',
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
              <p style={{ color: '#666', margin: '0 0 1rem 0' }}>No posts yet. Be the first to share!</p>
              <button
                onClick={() => setShowNewPostModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#e67e22',
                  border: 'none',
                  color: '#1a1a1a',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Create a Post
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: '#ffffff',
                    border: `2px solid ${hoveredPostId === post.id ? '#666' : '#e5e5e5'}`,
                    borderRadius: '6px',
                    padding: '1.5rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseEnter={() => setHoveredPostId(post.id)}
                  onMouseLeave={() => setHoveredPostId(null)}
                >
                  {/* Clickable post area */}
                  <Link
                    href={`/forum/${post.id}`}
                    style={{ textDecoration: 'none', display: 'block' }}
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
                        color: '#1a1a1a',
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
                      margin: '0 0 0.75rem 0'
                    }}>
                      {post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}
                    </p>
                  </Link>

                  {/* Post Actions - outside the Link to prevent navigation on click */}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: '#999', alignItems: 'center' }}>
                    <button
                      onClick={(e) => handleLike(e, post.id)}
                      style={{
                        background: likedPosts.has(post.id) ? 'rgba(230, 126, 34, 0.1)' : 'transparent',
                        border: `1px solid ${likedPosts.has(post.id) ? '#e67e22' : '#e5e5e5'}`,
                        borderRadius: '4px',
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.8125rem',
                        color: likedPosts.has(post.id) ? '#e67e22' : '#999',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                    </button>
                    <Link
                      href={`/forum/${post.id}`}
                      style={{
                        background: 'transparent',
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px',
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.8125rem',
                        color: '#999',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      💬 {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                    </Link>
                  </div>
                </div>
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
              <Link href="/videos" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                  cursor: 'pointer'
                }}>▶</div>
              </Link>
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
                  color: '#1a1a1a',
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

      {/* New Post Modal - copied from forum page */}
      {showNewPostModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
          onClick={() => setShowNewPostModal(false)}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '6px',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a1a1a', margin: '0 0 1.5rem 0' }}>
              New Post
            </h2>

            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#fafafa',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    color: '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none'
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#fafafa',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    color: '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none'
                  }}
                  placeholder="Give your post a title..."
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                  minLength={10}
                  maxLength={10000}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#fafafa',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    color: '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="What's on your mind? (min 10 characters)"
                />
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                  {newPost.content.length}/10000 characters
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={posting || newPost.content.length < 10}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: posting || newPost.content.length < 10 ? '#ccc' : '#e67e22',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#1a1a1a',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: posting || newPost.content.length < 10 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: '#fafafa',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    color: '#666',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
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
