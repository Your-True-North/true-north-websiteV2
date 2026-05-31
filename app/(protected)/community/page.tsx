'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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
  replies?: Reply[]
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

const categories = [
  'Introductions',
  'Reflections',
  'Wins & Breakthroughs',
  'Questions & Support',
  'Integration Practices'
]

const GAMBARINO = "'Gambarino', serif"
const BODY_FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
const ACCENT = '#9bc4b8'
const ORANGE = '#e67e22'

export default function CommunityPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [continueHovered, setContinueHovered] = useState(false)

  // Inline post creation state - always visible, no dropdown
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Introductions' })
  const [posting, setPosting] = useState(false)
  const [postFocused, setPostFocused] = useState(false)

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

  // Announcement popup
  const [announcement, setAnnouncement] = useState<{ id: number; title: string; body: string; url: string } | null>(null)

  // Email notification preference
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [notifLoaded, setNotifLoaded] = useState(false)

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

  // Load notification preference
  useEffect(() => {
    if (!user) return
    fetch(`/api/notifications/preferences?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setEmailNotifications(data.notifications ?? true)
        setNotifLoaded(true)
      })
      .catch(() => setNotifLoaded(true))
  }, [user?.id])

  const handleToggleNotifications = async () => {
    if (!user) return
    const newVal = !emailNotifications
    setEmailNotifications(newVal)
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notifications: newVal })
      })
    } catch {
      setEmailNotifications(!newVal)
    }
  }

  // Announcement popup
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
            setUser(prev => prev ? { ...prev, level: data.level, nextLevel: data.nextLevel, daysUntilNext: data.daysUntilNext } : null)
          }
        })
        .catch(err => console.error('Failed to fetch progress:', err))
    }
  }, [user?.id])

  // Fetch Start Here video
  useEffect(() => {
    if (!user) return
    const fetchNextVideo = async () => {
      try {
        const res = await fetch('/api/videos?category=all&sort=newest')
        const data = await res.json()
        if (data.videos) {
          const startHere = data.videos.find((v: any) =>
            v.title?.toLowerCase().includes('start here')
          )
          setNextVideo(startHere || data.videos[0])
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err)
      }
    }
    fetchNextVideo()
  }, [user])

  const getYouTubeId = (video: Video): string | null => {
    if (video.youtubeId) return video.youtubeId
    const url = video.youtubeUrl || video.youtube_url
    if (!url) return null
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)
    return match ? match[1] : null
  }

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
        if (data.post) setSelectedPost(data.post)
      }
    } catch (err) {
      console.error('Failed to fetch post detail:', err)
    } finally {
      setLoadingReplies(false)
    }
  }

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
        setNewPost({ title: '', content: '', category: 'Introductions' })
        setPostFocused(false)
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

  const Avatar = ({ name, photo, size = 40 }: { name: string, photo?: string | null, size?: number }) => (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: photo ? `url(${photo})` : ACCENT,
      border: '1px solid #e8e8e8',
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#555', fontSize: `${size * 0.35}px`, fontWeight: 600,
      flexShrink: 0, fontFamily: BODY_FONT
    }}>
      {!photo && name?.charAt(0).toUpperCase()}
    </div>
  )

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#555', fontFamily: BODY_FONT }}>Loading...</div>
      </div>
    )
  }

  const youtubeId = nextVideo ? getYouTubeId(nextVideo) : null
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null

  const renderVideoCard = () => (
    <>
      {showVideoPlayer && youtubeId ? (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '6px', background: '#000' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={() => setIsVideoExpanded(true)} style={{ flex: 1, padding: '0.5rem', background: '#333', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: BODY_FONT }}>↗ Expand</button>
            <button onClick={() => { setShowVideoPlayer(false); setIsVideoExpanded(false) }} style={{ padding: '0.5rem 1rem', background: '#e8e8e8', border: 'none', borderRadius: '4px', color: '#333', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: BODY_FONT }}>✕</button>
          </div>
        </div>
      ) : thumbnailUrl ? (
        <div onClick={() => youtubeId && setShowVideoPlayer(true)} style={{ width: '100%', height: '140px', borderRadius: '6px', marginBottom: '1rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          <img src={thumbnailUrl} alt={nextVideo?.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', paddingLeft: '3px' }}>▶</div>
          </div>
        </div>
      ) : null}
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#9bc4b8', marginBottom: '4px', fontFamily: BODY_FONT }}>Continue Your Journey</div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0ede8', margin: '0 0 4px 0', fontFamily: GAMBARINO, lineHeight: 1.3 }}>
        {nextVideo?.title || 'Start Here'}
      </h3>
      {nextVideo?.duration && <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.75rem', fontFamily: BODY_FONT }}>{nextVideo.duration} min</div>}
      <button
        onClick={() => router.push(nextVideo ? `/videos/${nextVideo.id}` : '/videos')}
        style={{ padding: '0.625rem 1.25rem', background: continueHovered ? '#000' : '#1a1a1a', border: 'none', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'background 0.15s ease', fontFamily: BODY_FONT }}
        onMouseEnter={() => setContinueHovered(true)}
        onMouseLeave={() => setContinueHovered(false)}
      >
        Continue →
      </button>
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0d', fontFamily: BODY_FONT }}>
      <style>{`
        * { box-sizing: border-box; }
        textarea { font-family: inherit; }
        select { font-family: inherit; }
        textarea::placeholder { color: #555 !important; }
        input::placeholder { color: #555 !important; }
        select option { background: #1a1a18; color: #f0ede8; }
      `}</style>

      {/* Announcement popup */}
      {announcement && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: '#1a1a18', borderRadius: '6px', maxWidth: '480px', width: '100%', padding: '2rem', border: '1px solid #2e2e2c', position: 'relative' }}>
            <button onClick={() => { localStorage.setItem('dismissed_announcement', String(announcement.id)); setAnnouncement(null) }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.25rem', color: '#666', cursor: 'pointer', lineHeight: 1 }}>×</button>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: '#9bc4b8', marginBottom: '12px' }}>From Mason</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f0ede8', marginBottom: '12px', lineHeight: 1.4 }}>{announcement.title}</h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#a0a09c', marginBottom: '1.5rem' }}>{announcement.body}</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {announcement.url && announcement.url !== '/members' && (
                <a href={announcement.url} onClick={() => { localStorage.setItem('dismissed_announcement', String(announcement.id)); setAnnouncement(null) }} style={{ flex: 1, display: 'block', textAlign: 'center' as const, padding: '12px', background: '#9bc4b8', color: '#0a0a0a', borderRadius: '4px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>View Now</a>
              )}
              <button onClick={() => { localStorage.setItem('dismissed_announcement', String(announcement.id)); setAnnouncement(null) }} style={{ flex: 1, padding: '12px', background: '#252523', border: '1px solid #333', borderRadius: '4px', color: '#888', fontSize: '14px', cursor: 'pointer', fontFamily: BODY_FONT }}>Got it</button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: '1160px', margin: '0 auto',
        padding: isMobile ? '1.25rem 1rem 3rem' : '2rem 1.5rem 3rem',
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '1.5rem',
        alignItems: 'start'
      }}>

        {/* LEFT COLUMN */}
        <div>

          {/* Video card - mobile only (desktop version is in aside) */}
          {isMobile && (
            <div style={{ background: '#1a1a18', border: '1px solid #2c2c2a', borderRadius: '6px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              {renderVideoCard()}
            </div>
          )}

          {/* Journey progress - mobile only */}
          {isMobile && (() => {
            const stages = ['Seeker', 'Explorer', 'Pathfinder', 'Guide']
            const currentIndex = Math.max(0, stages.indexOf(user?.level || 'Seeker'))
            const overallProgress = user?.progress ?? 0
            const levelMin = currentIndex * 25
            const levelProgress = currentIndex === 3 ? 100 : Math.max(0, Math.min(100, ((overallProgress - levelMin) / 25) * 100))
            const fillPercent = Math.min(100, (currentIndex / 3) * 100 + (levelProgress / 3))
            return (
              <div style={{ background: '#1a1a18', border: '1px solid #2c2c2a', borderRadius: '6px', padding: '1.25rem 1.25rem 1.75rem', marginBottom: '1.25rem' }}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#9bc4b8', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: '4px' }}>Your Journey</div>
                  <div style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.5 }}>Track your progress here and compare it to your life elevation outside the Circle.</div>
                </div>
                <div style={{ position: 'relative', height: '48px' }}>
                  <div style={{ position: 'absolute', top: '9px', left: 0, right: 0, height: '2px', background: '#2a2a28', borderRadius: '1px' }} />
                  <div style={{ position: 'absolute', top: '9px', left: 0, height: '2px', width: `${fillPercent}%`, background: 'linear-gradient(90deg, #5a9e6e, #3d7a52)', borderRadius: '1px', transition: 'width 0.8s ease' }} />
                  {stages.map((stage, index) => {
                    const isCurrent = index === currentIndex
                    const isCompleted = index < currentIndex
                    const posPercent = (index / 3) * 100
                    const isFirst = index === 0
                    const isLast = index === 3
                    return (
                      <div key={stage} style={{ position: 'absolute', left: `${posPercent}%`, top: 0, transform: isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center' }}>
                        <div className={isCurrent ? 'journey-pulse-dot' : ''} style={{ width: '11px', height: '11px', borderRadius: '50%', background: isCurrent ? '#4a9e5c' : isCompleted ? '#4a9e5c' : '#1a1a18', border: `2px solid ${isCurrent || isCompleted ? '#4a9e5c' : '#444'}`, position: 'relative', zIndex: 1 }} />
                        <div style={{ marginTop: '8px', fontSize: '0.68rem', color: isCurrent ? '#f0ede8' : isCompleted ? '#4a9e5c' : '#555', fontWeight: isCurrent ? 700 : 400, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{stage}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* Post Composer — always visible, expands on focus */}
          <div style={{
            background: '#1a1a18',
            border: '1px solid #2c2c2a',
            borderRadius: '6px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Avatar name={user?.name || ''} size={38} />
              <div style={{ flex: 1 }}>
                {!postFocused ? (
                  <div
                    onClick={() => setPostFocused(true)}
                    style={{
                      padding: '0.625rem 1rem',
                      background: '#252523',
                      border: '1px solid #333331',
                      borderRadius: '4px',
                      color: '#555',
                      fontSize: '0.9375rem',
                      cursor: 'text',
                      userSelect: 'none'
                    }}
                  >
                    What's alive in you today?
                  </div>
                ) : (
                  <form onSubmit={handleCreatePost}>
                    <div style={{ marginBottom: '0.625rem' }}>
                      <select
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        style={{
                          padding: '0.4rem 0.75rem', background: '#252523',
                          border: '1px solid #333', borderRadius: '4px',
                          color: '#c0bdb8', fontSize: '0.8125rem', outline: 'none'
                        }}
                      >
                        {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Title (optional)"
                      style={{
                        width: '100%', padding: '0.5rem 0', background: 'transparent',
                        border: 'none', borderBottom: '1px solid #333',
                        color: '#f0ede8', fontSize: '1rem', fontWeight: 600,
                        outline: 'none', marginBottom: '0.5rem', fontFamily: GAMBARINO
                      }}
                    />
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      required
                      minLength={10}
                      maxLength={10000}
                      rows={4}
                      autoFocus
                      placeholder="What's on your mind?"
                      style={{
                        width: '100%', padding: '0.5rem 0', background: 'transparent',
                        border: 'none', color: '#f0ede8', fontSize: '0.9375rem',
                        outline: 'none', resize: 'vertical', lineHeight: 1.6
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #2a2a28' }}>
                      <span style={{ fontSize: '0.75rem', color: '#444' }}>{newPost.content.length}/10000</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => { setPostFocused(false); setNewPost({ title: '', content: '', category: 'Introductions' }) }}
                          style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #333', borderRadius: '4px', color: '#666', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={posting || newPost.content.length < 10}
                          style={{
                            padding: '0.5rem 1.25rem',
                            background: posting || newPost.content.length < 10 ? '#333' : '#9bc4b8',
                            border: 'none', borderRadius: '4px', color: posting || newPost.content.length < 10 ? '#555' : '#0a0a0a',
                            fontSize: '0.8125rem', fontWeight: 700,
                            cursor: posting || newPost.content.length < 10 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {posting ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem', WebkitOverflowScrolling: 'touch' as any }}>
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.4375rem 0.875rem',
                  background: activeCategory === cat ? '#f0ede8' : '#1a1a18',
                  border: '1px solid ' + (activeCategory === cat ? '#f0ede8' : '#333331'),
                  borderRadius: '3px',
                  color: activeCategory === cat ? '#0f0f0d' : '#777',
                  fontSize: '0.8125rem', fontWeight: activeCategory === cat ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'All' ? 'All Posts' : cat}
              </button>
            ))}
          </div>

          {/* Introductions prompt */}
          {activeCategory === 'Introductions' && (
            <div style={{
              background: '#1a1a18',
              border: '1px solid #2c2c2a',
              borderLeft: '3px solid #9bc4b8',
              borderRadius: '4px',
              padding: '1.125rem 1.25rem',
              marginBottom: '1.25rem',
              fontSize: '0.9375rem',
              color: '#a0a09c',
              lineHeight: 1.7
            }}>
              <span style={{ fontWeight: 700, color: '#f0ede8' }}>Introduce yourself.</span> Who you are, what pulled you here, what you're wanting to shift.
            </div>
          )}

          {/* Posts Feed */}
          {posts.filter(p => activeCategory === 'All' || p.category === activeCategory).length === 0 ? (
            <div style={{ background: '#1a1a18', border: '1px solid #2c2c2a', borderRadius: '6px', padding: '3rem 2rem', textAlign: 'center' }}>
              <p style={{ color: '#555', margin: '0 0 1rem 0', fontFamily: BODY_FONT }}>
                {activeCategory === 'All' ? 'No posts yet. Be the first to share.' : `No posts in ${activeCategory} yet.`}
              </p>
              <button onClick={() => setPostFocused(true)} style={{ padding: '0.75rem 1.5rem', background: '#f0ede8', border: 'none', color: '#0f0f0d', borderRadius: '4px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                Create a Post
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {posts
                .filter(p => activeCategory === 'All' || p.category === activeCategory)
                .map((post) => (
                <div key={post.id} style={{
                  background: '#1a1a18',
                  border: '1px solid #2c2c2a',
                  borderLeft: '3px solid #2c2c2a',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  transition: 'border-left-color 0.2s ease'
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = '#9bc4b8')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderLeftColor = '#2c2c2a')}
                >
                  <div style={{ padding: '1.25rem 1.25rem 0.875rem' }}>
                    {/* Author row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                      <Avatar name={post.user_name} photo={post.user_photo} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f0ede8' }}>{post.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#555' }}>
                          {getTimeAgo(post.created_at)}
                          {post.category && <><span style={{ margin: '0 4px', color: '#444' }}>·</span><span style={{ color: ORANGE, fontWeight: 600 }}>{post.category}</span></>}
                        </div>
                      </div>
                    </div>

                    {/* Post content */}
                    {post.title && (
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f0ede8', margin: '0 0 0.375rem 0', fontFamily: GAMBARINO, lineHeight: 1.3 }}>
                        {post.title}
                      </h3>
                    )}
                    <p style={{ fontSize: '0.9375rem', color: '#a0a09c', lineHeight: 1.65, margin: '0 0 0.875rem 0', whiteSpace: 'pre-wrap' }}>
                      {expandedPostId === post.id ? post.content : (
                        post.content.length > 280 ? post.content.substring(0, 280) + '...' : post.content
                      )}
                    </p>

                    {/* Action bar */}
                    <div style={{ display: 'flex', gap: '0.25rem', borderTop: '1px solid #242422', paddingTop: '0.625rem' }}>
                      <button
                        onClick={(e) => handleLike(e, post.id)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                          background: 'transparent', border: 'none', padding: '0.5rem',
                          fontSize: '0.8125rem', fontWeight: 600,
                          color: likedPosts.has(post.id) ? ORANGE : '#555',
                          cursor: 'pointer', borderRadius: '4px', transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#252523'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {likedPosts.has(post.id) ? '♥' : '♡'} {post.like_count || ''}
                      </button>
                      <button
                        onClick={() => handleToggleComments(post)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                          background: expandedPostId === post.id ? '#252523' : 'transparent',
                          border: 'none', padding: '0.5rem',
                          fontSize: '0.8125rem', fontWeight: 600,
                          color: expandedPostId === post.id ? ACCENT : '#555',
                          cursor: 'pointer', borderRadius: '4px', transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#252523'}
                        onMouseLeave={(e) => { if (expandedPostId !== post.id) e.currentTarget.style.background = 'transparent' }}
                      >
                        ↩ {post.reply_count > 0 ? `${post.reply_count} ${post.reply_count === 1 ? 'comment' : 'comments'}` : 'Comment'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Comments — always visible */}
                  {((post.replies && post.replies.length > 0) || expandedPostId === post.id) && (
                    <div style={{ borderTop: '1px solid #242422', background: '#141412', padding: '1rem 1.25rem' }}>
                      {loadingReplies && expandedPostId === post.id ? (
                        <p style={{ color: '#555', fontSize: '0.875rem', margin: 0 }}>Loading comments...</p>
                      ) : (
                        (() => {
                          const allInlineReplies = post.replies || []
                          const displayReplies = expandedPostId === post.id ? replies : allInlineReplies.slice(0, 3)
                          const hasMoreReplies = expandedPostId !== post.id && allInlineReplies.length > 3
                          return displayReplies.length === 0 ? null : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                          {buildReplyTree(displayReplies).map((reply) => {
                            const renderReply = (r: Reply, depth: number) => (
                              <div key={r.id} style={{ marginLeft: depth > 0 ? '1.5rem' : '0', marginBottom: '0.5rem' }}>
                                <div style={{
                                  padding: '0.75rem',
                                  background: depth > 0 ? '#1c1c1a' : '#1e1e1c',
                                  borderRadius: '4px',
                                  border: '1px solid #2a2a28',
                                  borderLeft: depth > 0 ? `3px solid ${ACCENT}` : `3px solid #333`
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                    <Avatar name={r.user_name} photo={r.user_photo} size={26} />
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f0ede8' }}>{r.user_name}</span>
                                    <span style={{ fontSize: '0.6875rem', color: '#444' }}>{getTimeAgo(r.created_at)}</span>
                                  </div>
                                  <p style={{ fontSize: '0.875rem', color: '#a0a09c', lineHeight: 1.5, margin: '0 0 0.375rem 0', whiteSpace: 'pre-wrap' }}>{r.content}</p>
                                  {depth < 3 && (
                                    <button
                                      onClick={() => setReplyingToId(replyingToId === r.id ? null : r.id)}
                                      style={{ background: 'none', border: 'none', color: replyingToId === r.id ? ORANGE : '#555', fontSize: '0.6875rem', cursor: 'pointer', padding: 0, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}
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
                          {hasMoreReplies && (
                            <button onClick={() => handleToggleComments(post)} style={{ background: 'none', border: 'none', color: '#9bc4b8', fontSize: '0.8125rem', cursor: 'pointer', padding: '0.125rem 0', fontFamily: BODY_FONT, textAlign: 'left' as const, fontWeight: 600 }}>
                              See all {post.reply_count} comments →
                            </button>
                          )}
                        </div>
                        )
                        })()
                      )}

                      {/* Reply form — only show when post is expanded */}
                      {expandedPostId === post.id && <form onSubmit={handleReply}>
                        {replyingToId && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0.625rem', background: 'rgba(155,196,184,0.1)', borderRadius: '4px', marginBottom: '0.5rem', fontSize: '0.75rem', color: ACCENT }}>
                            <span>Replying to {replies.find(r => r.id === replyingToId)?.user_name || 'comment'}</span>
                            <button type="button" onClick={() => setReplyingToId(null)} style={{ background: 'none', border: 'none', color: ACCENT, cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}>✕</button>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <Avatar name={user?.name || ''} size={28} />
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={replyingToId ? 'Write a reply...' : 'Write a comment...'}
                            rows={1}
                            onFocus={(e) => e.currentTarget.rows = 3}
                            onBlur={(e) => { if (!replyContent) e.currentTarget.rows = 1 }}
                            style={{ flex: 1, padding: '0.5rem 0.75rem', background: '#252523', border: '1px solid #333', borderRadius: '4px', color: '#f0ede8', fontSize: '0.875rem', outline: 'none', resize: 'none', lineHeight: 1.5 }}
                          />
                          <button
                            type="submit"
                            disabled={submittingReply || !replyContent.trim()}
                            style={{ padding: '0.5rem 0.875rem', background: submittingReply || !replyContent.trim() ? '#252523' : '#9bc4b8', border: 'none', borderRadius: '4px', color: submittingReply || !replyContent.trim() ? '#444' : '#0a0a0a', fontSize: '0.8125rem', fontWeight: 700, cursor: submittingReply || !replyContent.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {submittingReply ? '...' : 'Post'}
                          </button>
                        </div>
                      </form>}

                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        {!isMobile && (
          <aside style={{ position: 'sticky', top: '5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Video card */}
            <div style={{ background: '#1a1a18', border: '1px solid #2c2c2a', borderRadius: '6px', padding: '1.25rem' }}>
              {renderVideoCard()}
            </div>

            {/* Journey progress */}
            {(() => {
              const stages = ['Seeker', 'Explorer', 'Pathfinder', 'Guide']
              const currentIndex = Math.max(0, stages.indexOf(user?.level || 'Seeker'))
              const overallProgress = user?.progress ?? 0
              const levelMin = currentIndex * 25
              const levelProgress = currentIndex === 3 ? 100 : Math.max(0, Math.min(100, ((overallProgress - levelMin) / 25) * 100))
              const fillPercent = Math.min(100, (currentIndex / 3) * 100 + (levelProgress / 3))
              return (
                <div style={{ background: '#1a1a18', border: '1px solid #2c2c2a', borderRadius: '6px', padding: '1.25rem 1.25rem 1.75rem' }}>
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#9bc4b8', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: '4px' }}>Your Journey</div>
                    <div style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.5 }}>Track your progress here and compare it to your life elevation outside the Circle.</div>
                  </div>
                  <div style={{ position: 'relative', height: '48px' }}>
                    <div style={{ position: 'absolute', top: '9px', left: 0, right: 0, height: '2px', background: '#2a2a28', borderRadius: '1px' }} />
                    <div style={{ position: 'absolute', top: '9px', left: 0, height: '2px', width: `${fillPercent}%`, background: 'linear-gradient(90deg, #5a9e6e, #3d7a52)', borderRadius: '1px', transition: 'width 0.8s ease' }} />
                    {stages.map((stage, index) => {
                      const isCurrent = index === currentIndex
                      const isCompleted = index < currentIndex
                      const posPercent = (index / 3) * 100
                      const isFirst = index === 0
                      const isLast = index === 3
                      return (
                        <div key={stage} style={{ position: 'absolute', left: `${posPercent}%`, top: 0, transform: isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center' }}>
                          <div className={isCurrent ? 'journey-pulse-dot' : ''} style={{ width: '11px', height: '11px', borderRadius: '50%', background: isCurrent ? '#4a9e5c' : isCompleted ? '#4a9e5c' : '#1a1a18', border: `2px solid ${isCurrent || isCompleted ? '#4a9e5c' : '#444'}`, position: 'relative', zIndex: 1 }} />
                          <div style={{ marginTop: '8px', fontSize: '0.68rem', color: isCurrent ? '#f0ede8' : isCompleted ? '#4a9e5c' : '#555', fontWeight: isCurrent ? 700 : 400, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{stage}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Quick links */}
            <div style={{ background: '#1a1a18', border: '1px solid #2c2c2a', borderRadius: '6px', padding: '1.25rem' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#9bc4b8', marginBottom: '0.875rem', fontWeight: 700, textTransform: 'uppercase' }}>Quick Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <a href="/videos" style={{ color: '#c0bdb8', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0', borderBottom: '1px solid #242422', fontFamily: GAMBARINO }}>Video Library</a>
                <a href="/calls" style={{ color: '#c0bdb8', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0', fontFamily: GAMBARINO }}>Live Call Calendar</a>
              </div>
            </div>

            {/* Email notification toggle */}
            {notifLoaded && (
              <div style={{ background: '#1a1a18', border: '1px solid #2c2c2a', borderRadius: '6px', padding: '1.25rem' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#9bc4b8', marginBottom: '0.875rem', fontWeight: 700, textTransform: 'uppercase' as const }}>Notifications</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#c0bdb8', marginBottom: '2px' }}>Community emails</div>
                    <div style={{ fontSize: '0.75rem', color: '#555' }}>{emailNotifications ? 'New posts and replies' : 'Off'}</div>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    aria-label={emailNotifications ? 'Disable email notifications' : 'Enable email notifications'}
                    style={{
                      flexShrink: 0, width: '44px', height: '24px', borderRadius: '12px',
                      background: emailNotifications ? '#9bc4b8' : '#333',
                      border: 'none', cursor: 'pointer', position: 'relative',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: emailNotifications ? '23px' : '3px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s ease'
                    }} />
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Expanded video modal */}
      {isVideoExpanded && youtubeId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '1rem' : '2rem' }} onClick={() => setIsVideoExpanded(false)}>
          <div style={{ maxWidth: '1200px', width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: '-3rem', right: 0, display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setIsVideoExpanded(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.8125rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '4px' }}>↙ Back</button>
              <button onClick={() => { setShowVideoPlayer(false); setIsVideoExpanded(false) }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.8125rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '4px' }}>✕ Close</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '6px' }}>
              <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
            <div style={{ background: '#1a1a18', padding: '1.5rem', borderRadius: '0 0 6px 6px', border: '1px solid #2c2c2a', borderTop: 'none' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0ede8', margin: '0 0 0.5rem 0', fontFamily: GAMBARINO }}>{nextVideo?.title}</h2>
              {nextVideo?.description && <p style={{ fontSize: '0.875rem', color: '#a0a09c', margin: 0, lineHeight: 1.6 }}>{nextVideo.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
