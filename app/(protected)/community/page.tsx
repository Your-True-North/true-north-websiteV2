'use client'

import { useEffect, useState, useCallback } from 'react'
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

interface Reply {
  id: number
  content: string
  user_name: string
  user_photo: string | null
  created_at: string
  parent_reply_id: number | null
  replies?: Reply[]
}

interface Video {
  id: number
  title: string
  description?: string
  youtube_url?: string
  youtubeId?: string
  youtubeUrl?: string
  category?: string
  duration?: string
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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null)
  const [continueHovered, setContinueHovered] = useState(false)

  // Inline post creation state
  const [showInlinePost, setShowInlinePost] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Introductions' })
  const [posting, setPosting] = useState(false)

  // Category filter
  const [activeCategory, setActiveCategory] = useState('All')

  // Like tracking
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  // Inline comment expansion state
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  // Nested reply state
  const [replyingToId, setReplyingToId] = useState<number | null>(null)

  // Video state
  const [nextVideo, setNextVideo] = useState<Video | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [isVideoExpanded, setIsVideoExpanded] = useState(false)

  // Auth
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

  // Fetch posts
  const fetchPosts = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user, fetchPosts])

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false)
      }
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
            setUser(prev => prev ? { ...prev, level: data.level, nextLevel: data.nextLevel, daysUntilNext: data.daysUntilNext } : null)
          }
        })
        .catch(err => console.error('Failed to fetch progress:', err))
    }
  }, [user?.id])

  // Fetch next video
  useEffect(() => {
    if (!user) return
    const fetchNextVideo = async () => {
      try {
        const res = await fetch('/api/admin/videos')
        const data = await res.json()
        if (data.videos && data.videos.length > 0) {
          setNextVideo(data.videos[0])
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err)
      }
    }
    fetchNextVideo()
  }, [user])

  // Get YouTube ID from video object
  const getYouTubeId = (video: Video): string | null => {
    if (video.youtubeId) return video.youtubeId
    const url = video.youtubeUrl || video.youtube_url
    if (!url) return null
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)
    return match ? match[1] : null
  }

  // Toggle inline comment expansion
  const handleToggleComments = async (post: Post) => {
    if (expandedPostId === post.id) {
      setExpandedPostId(null)
      setReplies([])
      setReplyContent('')
      setReplyingToId(null)
      return
    }
    setExpandedPostId(post.id)
    setSelectedPost(post)
    setLoadingReplies(true)
    setReplyContent('')
    setReplyingToId(null)
    try {
      const res = await fetch(`/api/forum/posts/${post.id}`)
      const data = await res.json()
      if (res.ok) {
        setReplies(data.replies || [])
        if (data.post) {
          setSelectedPost(data.post)
        }
      }
    } catch (err) {
      console.error('Failed to fetch post detail:', err)
    } finally {
      setLoadingReplies(false)
    }
  }

  // Like handler for feed
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
          if (data.liked) { next.add(postId) } else { next.delete(postId) }
          return next
        })
        fetchPosts()
      }
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  // Like handler (used for both feed and inline expanded)
  const handleDetailLike = async (postId: number) => {
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
          if (data.liked) { next.add(postId) } else { next.delete(postId) }
          return next
        })
        fetchPosts()
      }
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  // Reply handler
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !expandedPostId || !replyContent.trim()) return
    setSubmittingReply(true)
    try {
      const res = await fetch(`/api/forum/posts/${expandedPostId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, content: replyContent, parent_reply_id: replyingToId })
      })
      if (res.ok) {
        const data = await res.json()
        setReplies(prev => [...prev, { ...data.reply, user_name: user.name, user_photo: null, parent_reply_id: replyingToId }])
        setReplyContent('')
        setReplyingToId(null)
        fetchPosts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to post reply')
      }
    } catch (err) {
      console.error('Reply error:', err)
      alert('Something went wrong')
    } finally {
      setSubmittingReply(false)
    }
  }

  // Build reply tree from flat list
  const buildReplyTree = (flatReplies: Reply[]): Reply[] => {
    const map = new Map<number, Reply>()
    const roots: Reply[] = []
    flatReplies.forEach(r => map.set(r.id, { ...r, replies: [] }))
    flatReplies.forEach(r => {
      const reply = map.get(r.id)!
      if (r.parent_reply_id && map.has(r.parent_reply_id)) {
        map.get(r.parent_reply_id)!.replies!.push(reply)
      } else {
        roots.push(reply)
      }
    })
    return roots
  }

  // Create post handler
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
        setShowInlinePost(false)
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

  const allLevels = ['Seeker', 'Explorer', 'Pathfinder', 'Guide']
  const currentLevel = user?.level || 'Seeker'
  const currentLevelIndex = allLevels.indexOf(currentLevel)
  const youtubeId = nextVideo ? getYouTubeId(nextVideo) : null
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null

  // Shared video card content
  const renderVideoCard = (height: string) => (
    <>
      {showVideoPlayer && youtubeId ? (
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <div style={{
            position: 'relative', paddingBottom: '56.25%', height: 0,
            overflow: 'hidden', borderRadius: '4px', background: '#000'
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={() => setIsVideoExpanded(true)} style={{
              flex: 1, padding: '0.5rem', background: '#333', border: 'none',
              borderRadius: '4px', color: '#fff', fontSize: '0.8125rem', cursor: 'pointer'
            }}>
              ↗ Expand
            </button>
            <button onClick={() => { setShowVideoPlayer(false); setIsVideoExpanded(false) }} style={{
              padding: '0.5rem 1rem', background: '#e5e5e5', border: 'none',
              borderRadius: '4px', color: '#333', fontSize: '0.8125rem', cursor: 'pointer'
            }}>
              ✕ Close
            </button>
          </div>
        </div>
      ) : thumbnailUrl ? (
        <div
          onClick={() => { if (youtubeId) setShowVideoPlayer(true) }}
          style={{
            width: '100%',
            height,
            borderRadius: '4px',
            marginBottom: '1rem',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <img
            src={thumbnailUrl}
            alt={nextVideo?.title || 'Next video'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)', borderRadius: '4px'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', color: '#333'
            }}>▶</div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => { if (youtubeId) setShowVideoPlayer(true) }}
          style={{
            width: '100%', height,
            background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', color: '#fff', marginBottom: '1rem',
            cursor: youtubeId ? 'pointer' : 'default'
          }}
        >▶</div>
      )}
      <div style={{
        fontSize: '0.75rem', fontWeight: 700,
        textTransform: 'uppercase' as const, letterSpacing: '0.15em',
        color: '#e67e22', marginBottom: '0.5rem'
      }}>
        Continue Your Journey
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>
        {nextVideo?.title || 'Understanding the Nervous System'}
      </h3>
      {nextVideo?.duration && (
        <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.75rem' }}>
          {nextVideo.duration}
        </div>
      )}
      <button
        onClick={() => { if (youtubeId) setShowVideoPlayer(true); else router.push('/videos') }}
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          background: continueHovered ? '#1a1a1a' : '#333333',
          border: 'none', color: '#ffffff',
          fontSize: '0.875rem', fontWeight: 700,
          textTransform: 'uppercase' as const,
          borderRadius: '4px', cursor: 'pointer',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={() => setContinueHovered(true)}
        onMouseLeave={() => setContinueHovered(false)}
      >
        Continue →
      </button>
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Top Navigation - z-index 50 to avoid overlapping members area menus */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#fafafa', borderBottom: '1px solid #e5e5e5', padding: '0.75rem 0'
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          position: 'relative'
        }}>
          <Link href="/community" style={{
            fontSize: '1.25rem', fontWeight: 600, color: '#1a1a1a',
            textDecoration: 'none', fontFamily: 'Gambarino, serif', whiteSpace: 'nowrap'
          }}>
            True North
          </Link>

          <div style={{ display: isMobile ? 'none' : 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/videos" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9375rem' }}>Teachings</Link>
            <Link href="/calls" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9375rem' }}>Live Call Calendar</Link>
            <Link href="/members" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9375rem' }}>Dashboard</Link>
            <Link href="/journey" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9375rem' }}>Journey</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isMobile && (
              <div style={{
                padding: '0.375rem 0.875rem', background: '#f0f0f0', borderRadius: '20px',
                fontSize: '0.8125rem', color: '#666'
              }}>
                {user?.name || 'Profile'}
              </div>
            )}
            {isMobile && (
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} style={{
                background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px',
                padding: '0.5rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '20px' }}>
                  <div style={{ width: '100%', height: '2px', background: '#1a1a1a' }} />
                  <div style={{ width: '100%', height: '2px', background: '#1a1a1a' }} />
                  <div style={{ width: '100%', height: '2px', background: '#1a1a1a' }} />
                </div>
              </button>
            )}
          </div>
        </div>

        {isMobile && showMobileMenu && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#fff', borderBottom: '1px solid #e5e5e5',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 99,
            display: 'flex', flexDirection: 'column'
          }}>
            <Link href="/videos" onClick={() => setShowMobileMenu(false)} style={{
              padding: '1rem 1.5rem', color: '#1a1a1a', textDecoration: 'none',
              borderBottom: '1px solid #f5f5f5', fontSize: '0.95rem'
            }}>Teachings</Link>
            <Link href="/calls" onClick={() => setShowMobileMenu(false)} style={{
              padding: '1rem 1.5rem', color: '#1a1a1a', textDecoration: 'none',
              borderBottom: '1px solid #f5f5f5', fontSize: '0.95rem'
            }}>Live Call Calendar</Link>
            <Link href="/members" onClick={() => setShowMobileMenu(false)} style={{
              padding: '1rem 1.5rem', color: '#1a1a1a', textDecoration: 'none',
              borderBottom: '1px solid #f5f5f5', fontSize: '0.95rem'
            }}>Dashboard</Link>
            <Link href="/journey" onClick={() => setShowMobileMenu(false)} style={{
              padding: '1rem 1.5rem', color: '#1a1a1a', textDecoration: 'none',
              borderBottom: '1px solid #f5f5f5', fontSize: '0.95rem'
            }}>Journey</Link>
            <div style={{ padding: '1rem 1.5rem', background: '#f9f9f9', fontSize: '0.875rem', color: '#666' }}>
              Signed in as {user?.name}
            </div>
          </div>
        )}
      </nav>

      {/* Progress Bar */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: isMobile ? '1rem 1.5rem 0.75rem' : '1.5rem 1.5rem 1rem',
        borderBottom: '1px solid #e5e5e5'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: isMobile ? '0.375rem' : '0.75rem', fontFamily: 'Gambarino, serif',
          flexWrap: 'wrap'
        }}>
          {allLevels.map((level, index) => (
            <span key={level} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.375rem' : '0.75rem' }}>
              {index > 0 && <span style={{ color: '#ccc', fontSize: isMobile ? '0.875rem' : '1rem' }}>→</span>}
              <span style={{
                color: index === currentLevelIndex ? '#1a1a1a' : '#999',
                fontWeight: index === currentLevelIndex ? 700 : 400,
                fontSize: index === currentLevelIndex ? (isMobile ? '1rem' : '1.25rem') : (isMobile ? '0.875rem' : '1rem'),
                fontFamily: 'Gambarino, serif',
                transition: 'all 0.3s ease'
              }}>
                {level}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Welcome Greeting */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: isMobile ? '1rem 1.5rem 0.5rem' : '1.5rem 1.5rem 1rem'
      }}>
        <h1 style={{
          fontSize: isMobile ? '1.25rem' : '2rem', fontWeight: 300,
          color: '#1a1a1a', fontFamily: 'Gambarino, serif', margin: 0,
          lineHeight: 1.3
        }}>
          <span style={{ color: '#666', fontWeight: 300 }}>Welcome back,</span>{' '}
          <span style={{ fontWeight: 500 }}>{user?.name}</span>
        </h1>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem',
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
        gap: '2rem',
        alignItems: 'start'
      }}>
        <div>
        {/* "Write something" inline post bar */}
        <div style={{
          background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '6px',
          padding: '1rem 1.25rem', marginBottom: '1.25rem'
        }}>
          {!showInlinePost ? (
            <div
              onClick={() => setShowInlinePost(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer'
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #e67e22, #d35400)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '14px', fontWeight: 600, flexShrink: 0
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{
                flex: 1, padding: '0.625rem 1rem', background: '#f5f5f5',
                borderRadius: '6px', color: '#999', fontSize: '0.9375rem'
              }}>
                What's alive in you today?
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreatePost}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e67e22, #d35400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '14px', fontWeight: 600, flexShrink: 0
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>{user?.name}</div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  style={{
                    padding: '0.5rem 0.75rem', background: '#f5f5f5', border: '1px solid #e5e5e5',
                    borderRadius: '6px', color: '#1a1a1a', fontSize: '0.8125rem', outline: 'none'
                  }}>
                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Title (optional)"
                style={{
                  width: '100%', padding: '0.625rem 0', background: 'transparent', border: 'none',
                  borderBottom: '1px solid #f0f0f0', color: '#1a1a1a', fontSize: '1rem',
                  fontWeight: 600, outline: 'none', marginBottom: '0.5rem'
                }}
              />
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                required
                minLength={10}
                maxLength={10000}
                rows={4}
                placeholder="What's on your mind?"
                style={{
                  width: '100%', padding: '0.625rem 0', background: 'transparent',
                  border: 'none', color: '#1a1a1a', fontSize: '0.9375rem', outline: 'none',
                  resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#999' }}>{newPost.content.length}/10000</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => { setShowInlinePost(false); setNewPost({ title: '', content: '', category: 'Introductions' }) }} style={{
                    padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #e5e5e5',
                    borderRadius: '6px', color: '#666', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
                  }}>Cancel</button>
                  <button type="submit" disabled={posting || newPost.content.length < 10} style={{
                    padding: '0.5rem 1.25rem',
                    background: posting || newPost.content.length < 10 ? '#ccc' : '#e67e22',
                    border: 'none', borderRadius: '6px', color: '#ffffff',
                    fontSize: '0.8125rem', fontWeight: 600,
                    cursor: posting || newPost.content.length < 10 ? 'not-allowed' : 'pointer'
                  }}>
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Category Filter Buttons */}
        <div style={{
          display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
          overflowX: 'auto', paddingBottom: '0.25rem',
          WebkitOverflowScrolling: 'touch' as const
        }}>
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                background: activeCategory === cat ? '#1a1a1a' : '#ffffff',
                border: '1px solid ' + (activeCategory === cat ? '#1a1a1a' : '#e5e5e5'),
                borderRadius: '6px',
                color: activeCategory === cat ? '#ffffff' : '#666',
                fontSize: '0.8125rem', fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat === 'All' ? 'All Posts' : cat}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {posts.filter(p => activeCategory === 'All' || p.category === activeCategory).length === 0 ? (
          <div style={{
            background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '6px',
            padding: '3rem 2rem', textAlign: 'center'
          }}>
            <p style={{ color: '#666', margin: '0 0 1rem 0' }}>
              {activeCategory === 'All' ? 'No posts yet. Be the first to share!' : `No posts in ${activeCategory} yet.`}
            </p>
            <button onClick={() => setShowInlinePost(true)} style={{
              padding: '0.75rem 1.5rem', background: '#e67e22', border: 'none',
              color: '#ffffff', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
            }}>
              Create a Post
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {posts
              .filter(p => activeCategory === 'All' || p.category === activeCategory)
              .map((post) => (
              <div key={post.id} style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '6px',
                marginBottom: '0.75rem',
                overflow: 'hidden'
              }}>
                {/* Post Card */}
                <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
                  {/* Author row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: post.user_photo ? `url(${post.user_photo})` : 'linear-gradient(135deg, #e67e22, #d35400)',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '16px', fontWeight: 600, flexShrink: 0
                    }}>
                      {!post.user_photo && post.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>{post.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>
                        {getTimeAgo(post.created_at)}{post.category && <span style={{ color: '#ccc' }}> &middot; </span>}
                        {post.category && <span style={{ color: '#e67e22', fontWeight: 500 }}>{post.category}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Post content */}
                  {post.title && (
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 0.375rem 0' }}>
                      {post.title}
                    </h3>
                  )}
                  <p style={{ fontSize: '0.9375rem', color: '#333', lineHeight: 1.6, margin: '0 0 1rem 0', whiteSpace: 'pre-wrap' }}>
                    {expandedPostId === post.id ? post.content : (
                      post.content.length > 280 ? post.content.substring(0, 280) + '...' : post.content
                    )}
                  </p>

                  {/* Action bar */}
                  <div style={{
                    display: 'flex', gap: '0.25rem', borderTop: '1px solid #f0f0f0',
                    paddingTop: '0.625rem', marginBottom: '0.25rem'
                  }}>
                    <button onClick={(e) => { e.stopPropagation(); handleLike(e, post.id) }} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                      background: 'transparent', border: 'none', padding: '0.5rem',
                      fontSize: '0.8125rem', fontWeight: 500,
                      color: likedPosts.has(post.id) ? '#e67e22' : '#999',
                      cursor: 'pointer', borderRadius: '6px',
                      transition: 'background 0.15s ease'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.like_count || ''}
                    </button>
                    <button onClick={() => handleToggleComments(post)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                      background: expandedPostId === post.id ? '#f5f5f5' : 'transparent',
                      border: 'none', padding: '0.5rem',
                      fontSize: '0.8125rem', fontWeight: 500,
                      color: expandedPostId === post.id ? '#e67e22' : '#999',
                      cursor: 'pointer', borderRadius: '6px',
                      transition: 'background 0.15s ease'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => { if (expandedPostId !== post.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      💬 {post.reply_count || ''} {post.reply_count === 1 ? 'comment' : (post.reply_count > 0 ? 'comments' : 'Comment')}
                    </button>
                  </div>
                </div>

                {/* Inline Comments Section */}
                {expandedPostId === post.id && (
                  <div style={{ borderTop: '1px solid #e5e5e5', background: '#fafafa', padding: '1rem 1.25rem' }}>
                    {loadingReplies ? (
                      <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>Loading comments...</p>
                    ) : replies.length === 0 ? (
                      <p style={{ color: '#999', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>No comments yet. Be the first!</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                        {buildReplyTree(replies).map((reply) => {
                          const renderReply = (r: Reply, depth: number) => (
                            <div key={r.id} style={{ marginLeft: depth > 0 ? '1.5rem' : '0', marginBottom: '0.5rem' }}>
                              <div style={{
                                padding: '0.75rem',
                                background: depth > 0 ? '#f0f0f0' : '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid ' + (depth > 0 ? '#e8e8e8' : '#e5e5e5'),
                                borderLeft: depth > 0 ? '3px solid #e67e22' : '1px solid #e5e5e5'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                  <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: r.user_photo ? `url(${r.user_photo})` : 'linear-gradient(135deg, #e67e22, #d35400)',
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '11px', fontWeight: 600, flexShrink: 0
                                  }}>
                                    {!r.user_photo && r.user_name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a' }}>{r.user_name}</span>
                                  <span style={{ fontSize: '0.6875rem', color: '#999' }}>{getTimeAgo(r.created_at)}</span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.5, margin: '0 0 0.375rem 0', whiteSpace: 'pre-wrap' }}>{r.content}</p>
                                {depth < 3 && (
                                  <button
                                    onClick={() => setReplyingToId(replyingToId === r.id ? null : r.id)}
                                    style={{
                                      background: 'none', border: 'none', color: replyingToId === r.id ? '#e67e22' : '#999',
                                      fontSize: '0.6875rem', cursor: 'pointer', padding: 0, fontWeight: 600,
                                      textTransform: 'uppercase' as const, letterSpacing: '0.05em'
                                    }}
                                  >
                                    {replyingToId === r.id ? 'Cancel' : 'Reply'}
                                  </button>
                                )}
                              </div>
                              {r.replies?.map(nested => renderReply(nested, depth + 1))}
                            </div>
                          )
                          return renderReply(reply, 0)
                        })}
                      </div>
                    )}

                    {/* Inline reply form */}
                    <form onSubmit={handleReply}>
                      {replyingToId && (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.375rem 0.625rem', background: 'rgba(230, 126, 34, 0.1)',
                          borderRadius: '4px', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#e67e22'
                        }}>
                          <span>Replying to {replies.find(r => r.id === replyingToId)?.user_name || 'comment'}</span>
                          <button type="button" onClick={() => setReplyingToId(null)} style={{
                            background: 'none', border: 'none', color: '#e67e22', cursor: 'pointer', fontSize: '0.875rem', padding: 0
                          }}>✕</button>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #e67e22, #d35400)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '11px', fontWeight: 600, flexShrink: 0
                        }}>
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={replyingToId ? 'Write a reply...' : 'Write a comment...'}
                          rows={1}
                          onFocus={(e) => e.currentTarget.rows = 3}
                          onBlur={(e) => { if (!replyContent) e.currentTarget.rows = 1 }}
                          style={{
                            flex: 1, padding: '0.5rem 0.75rem', background: '#ffffff',
                            border: '1px solid #e5e5e5', borderRadius: '6px', color: '#1a1a1a',
                            fontSize: '0.875rem', outline: 'none', resize: 'none',
                            fontFamily: 'inherit', lineHeight: 1.5
                          }}
                        />
                        <button type="submit" disabled={submittingReply || !replyContent.trim()} style={{
                          padding: '0.5rem 0.875rem',
                          background: submittingReply || !replyContent.trim() ? '#ccc' : '#e67e22',
                          border: 'none', borderRadius: '6px', color: '#ffffff',
                          fontSize: '0.8125rem', fontWeight: 600,
                          cursor: submittingReply || !replyContent.trim() ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}>
                          {submittingReply ? '...' : 'Post'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Sidebar */}
        {!isMobile && (
          <aside style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '1.5rem' }}>
              {renderVideoCard('150px')}
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '1.5rem', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', margin: '0 0 1rem 0' }}>
                Your Journey
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'Gambarino, serif', flexWrap: 'wrap' }}>
                {['Seeker', 'Explorer', 'Pathfinder', 'Guide'].map((level, index) => (
                  <span key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {index > 0 && <span style={{ color: '#ccc' }}>→</span>}
                    <span style={{
                      color: level === (user?.level || 'Seeker') ? '#1a1a1a' : '#999',
                      fontWeight: level === (user?.level || 'Seeker') ? 700 : 400,
                      fontSize: level === (user?.level || 'Seeker') ? '1.125rem' : '0.875rem',
                      fontFamily: 'Gambarino, serif'
                    }}>{level}</span>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '1.5rem', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', margin: '0 0 1rem 0' }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="/videos" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>Teachings</a>
                <a href="/calls" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0' }}>Live Call Calendar</a>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Expanded Video Player Modal - only when user clicks Expand */}
      {isVideoExpanded && youtubeId && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: isMobile ? '1rem' : '2rem'
          }}
          onClick={() => { setIsVideoExpanded(false) }}
        >
          <div
            style={{ maxWidth: '1200px', width: '100%', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              position: 'absolute', top: '-3rem', right: 0,
              display: 'flex', gap: '1rem', alignItems: 'center'
            }}>
              <button onClick={() => setIsVideoExpanded(false)} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff', fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem 1rem',
                borderRadius: '4px'
              }}>
                ↙ Back to inline
              </button>
              <button onClick={() => { setShowVideoPlayer(false); setIsVideoExpanded(false) }} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff', fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem 1rem',
                borderRadius: '4px'
              }}>
                ✕ Close
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '6px' }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0 0 6px 6px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>
                {nextVideo?.title}
              </h2>
              {nextVideo?.description && (
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0, lineHeight: 1.6 }}>
                  {nextVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
