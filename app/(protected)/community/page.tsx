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
      <div style={{ minHeight: '100vh', background: '#f4f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontFamily: BODY_FONT }}>Loading...</div>
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
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#aaa', marginBottom: '4px', fontFamily: BODY_FONT }}>Continue Your Journey</div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px 0', fontFamily: GAMBARINO, lineHeight: 1.3 }}>
        {nextVideo?.title || 'Start Here'}
      </h3>
      {nextVideo?.duration && <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.75rem', fontFamily: BODY_FONT }}>{nextVideo.duration} min</div>}
      <button
        onClick={() => youtubeId ? setShowVideoPlayer(true) : router.push('/videos')}
        style={{ padding: '0.625rem 1.25rem', background: continueHovered ? '#000' : '#1a1a1a', border: 'none', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'background 0.15s ease', fontFamily: BODY_FONT }}
        onMouseEnter={() => setContinueHovered(true)}
        onMouseLeave={() => setContinueHovered(false)}
      >
        Continue →
      </button>
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f2', fontFamily: BODY_FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        textarea { font-family: inherit; }
        select { font-family: inherit; }
      `}</style>

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
            <div style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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
              <div style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '1.25rem 1.25rem 1.75rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#bbb', fontWeight: 600, textTransform: 'uppercase' as const, marginBottom: '4px' }}>Your Journey</div>
                  <div style={{ fontSize: '0.75rem', color: '#999', lineHeight: 1.5 }}>Track your progress here and compare it to your life elevation outside the Circle.</div>
                </div>
                <div style={{ position: 'relative', height: '48px' }}>
                  <div style={{ position: 'absolute', top: '9px', left: 0, right: 0, height: '2px', background: '#e0e0e0', borderRadius: '1px' }} />
                  <div style={{ position: 'absolute', top: '9px', left: 0, height: '2px', width: `${fillPercent}%`, background: 'linear-gradient(90deg, #5a9e6e, #3d7a52)', borderRadius: '1px', transition: 'width 0.8s ease' }} />
                  {stages.map((stage, index) => {
                    const isCurrent = index === currentIndex
                    const isCompleted = index < currentIndex
                    const posPercent = (index / 3) * 100
                    const isFirst = index === 0
                    const isLast = index === 3
                    return (
                      <div key={stage} style={{ position: 'absolute', left: `${posPercent}%`, top: 0, transform: isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center' }}>
                        <div className={isCurrent ? 'journey-pulse-dot' : ''} style={{ width: '11px', height: '11px', borderRadius: '50%', background: isCurrent ? '#4a9e5c' : isCompleted ? '#4a9e5c' : '#ffffff', border: `2px solid ${isCurrent || isCompleted ? '#4a9e5c' : '#d0d0d0'}`, position: 'relative', zIndex: 1 }} />
                        <div style={{ marginTop: '8px', fontSize: '0.68rem', color: isCurrent ? '#1a1a1a' : isCompleted ? '#4a9e5c' : '#bbb', fontWeight: isCurrent ? 600 : 400, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{stage}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* Post Composer — always visible, expands on focus */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e8e8e8',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Avatar name={user?.name || ''} size={38} />
              <div style={{ flex: 1 }}>
                {!postFocused ? (
                  <div
                    onClick={() => setPostFocused(true)}
                    style={{
                      padding: '0.625rem 1rem',
                      background: '#f7f7f5',
                      border: '1px solid #ebebeb',
                      borderRadius: '20px',
                      color: '#aaa',
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
                          padding: '0.4rem 0.75rem', background: '#f7f7f5',
                          border: '1px solid #ebebeb', borderRadius: '6px',
                          color: '#555', fontSize: '0.8125rem', outline: 'none'
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
                        border: 'none', borderBottom: '1px solid #ebebeb',
                        color: '#1a1a1a', fontSize: '1rem', fontWeight: 600,
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
                        border: 'none', color: '#1a1a1a', fontSize: '0.9375rem',
                        outline: 'none', resize: 'vertical', lineHeight: 1.6
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #ebebeb' }}>
                      <span style={{ fontSize: '0.75rem', color: '#ccc' }}>{newPost.content.length}/10000</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => { setPostFocused(false); setNewPost({ title: '', content: '', category: 'Introductions' }) }}
                          style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #e5e5e5', borderRadius: '6px', color: '#888', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={posting || newPost.content.length < 10}
                          style={{
                            padding: '0.5rem 1.25rem',
                            background: posting || newPost.content.length < 10 ? '#ddd' : '#1a1a1a',
                            border: 'none', borderRadius: '6px', color: '#fff',
                            fontSize: '0.8125rem', fontWeight: 600,
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
                  background: activeCategory === cat ? '#1a1a1a' : '#ffffff',
                  border: '1px solid ' + (activeCategory === cat ? '#1a1a1a' : '#e5e5e5'),
                  borderRadius: '20px',
                  color: activeCategory === cat ? '#ffffff' : '#666',
                  fontSize: '0.8125rem', fontWeight: 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: activeCategory === cat ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {cat === 'All' ? 'All Posts' : cat}
              </button>
            ))}
          </div>

          {/* Introductions prompt */}
          {activeCategory === 'Introductions' && (
            <div style={{
              background: '#fff8f0',
              border: '1px solid #f0e0cc',
              borderRadius: '10px',
              padding: '1.125rem 1.25rem',
              marginBottom: '1.25rem',
              fontSize: '0.9375rem',
              color: '#6b4c2a',
              lineHeight: 1.7
            }}>
              <span style={{ fontWeight: 600 }}>Introduce yourself.</span> Who you are, what pulled you here, what you're wanting to shift.
            </div>
          )}

          {/* Posts Feed */}
          {posts.filter(p => activeCategory === 'All' || p.category === activeCategory).length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ color: '#aaa', margin: '0 0 1rem 0', fontFamily: BODY_FONT }}>
                {activeCategory === 'All' ? 'No posts yet. Be the first to share.' : `No posts in ${activeCategory} yet.`}
              </p>
              <button onClick={() => setPostFocused(true)} style={{ padding: '0.75rem 1.5rem', background: '#1a1a1a', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                Create a Post
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {posts
                .filter(p => activeCategory === 'All' || p.category === activeCategory)
                .map((post) => (
                <div key={post.id} style={{
                  background: '#ffffff',
                  border: '1px solid #e8e8e8',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s ease'
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)')}
                >
                  <div style={{ padding: '1.25rem 1.25rem 0.875rem' }}>
                    {/* Author row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                      <Avatar name={post.user_name} photo={post.user_photo} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>{post.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#bbb' }}>
                          {getTimeAgo(post.created_at)}
                          {post.category && <><span style={{ margin: '0 4px', color: '#ddd' }}>·</span><span style={{ color: ORANGE, fontWeight: 500 }}>{post.category}</span></>}
                        </div>
                      </div>
                    </div>

                    {/* Post content */}
                    {post.title && (
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.375rem 0', fontFamily: GAMBARINO, lineHeight: 1.3 }}>
                        {post.title}
                      </h3>
                    )}
                    <p style={{ fontSize: '0.9375rem', color: '#444', lineHeight: 1.65, margin: '0 0 0.875rem 0', whiteSpace: 'pre-wrap' }}>
                      {expandedPostId === post.id ? post.content : (
                        post.content.length > 280 ? post.content.substring(0, 280) + '...' : post.content
                      )}
                    </p>

                    {/* Action bar */}
                    <div style={{ display: 'flex', gap: '0.25rem', borderTop: '1px solid #f2f2f2', paddingTop: '0.625rem' }}>
                      <button
                        onClick={(e) => handleLike(e, post.id)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                          background: 'transparent', border: 'none', padding: '0.5rem',
                          fontSize: '0.8125rem', fontWeight: 500,
                          color: likedPosts.has(post.id) ? ORANGE : '#bbb',
                          cursor: 'pointer', borderRadius: '6px', transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.like_count || ''}
                      </button>
                      <button
                        onClick={() => handleToggleComments(post)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                          background: expandedPostId === post.id ? '#fafafa' : 'transparent',
                          border: 'none', padding: '0.5rem',
                          fontSize: '0.8125rem', fontWeight: 500,
                          color: expandedPostId === post.id ? ORANGE : '#bbb',
                          cursor: 'pointer', borderRadius: '6px', transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={(e) => { if (expandedPostId !== post.id) e.currentTarget.style.background = 'transparent' }}
                      >
                        💬 {post.reply_count > 0 ? `${post.reply_count} ${post.reply_count === 1 ? 'comment' : 'comments'}` : 'Comment'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Comments */}
                  {expandedPostId === post.id && (
                    <div style={{ borderTop: '1px solid #f2f2f2', background: '#fafaf8', padding: '1rem 1.25rem' }}>
                      {loadingReplies ? (
                        <p style={{ color: '#bbb', fontSize: '0.875rem', margin: 0 }}>Loading comments...</p>
                      ) : replies.length === 0 ? (
                        <p style={{ color: '#bbb', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>No comments yet. Be the first.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                          {buildReplyTree(replies).map((reply) => {
                            const renderReply = (r: Reply, depth: number) => (
                              <div key={r.id} style={{ marginLeft: depth > 0 ? '1.5rem' : '0', marginBottom: '0.5rem' }}>
                                <div style={{
                                  padding: '0.75rem',
                                  background: depth > 0 ? '#f2f2f0' : '#ffffff',
                                  borderRadius: '8px',
                                  border: '1px solid ' + (depth > 0 ? '#ebebeb' : '#e8e8e8'),
                                  borderLeft: depth > 0 ? `3px solid ${ACCENT}` : '1px solid #e8e8e8'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                    <Avatar name={r.user_name} photo={r.user_photo} size={26} />
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a' }}>{r.user_name}</span>
                                    <span style={{ fontSize: '0.6875rem', color: '#ccc' }}>{getTimeAgo(r.created_at)}</span>
                                  </div>
                                  <p style={{ fontSize: '0.875rem', color: '#444', lineHeight: 1.5, margin: '0 0 0.375rem 0', whiteSpace: 'pre-wrap' }}>{r.content}</p>
                                  {depth < 3 && (
                                    <button
                                      onClick={() => setReplyingToId(replyingToId === r.id ? null : r.id)}
                                      style={{ background: 'none', border: 'none', color: replyingToId === r.id ? ORANGE : '#bbb', fontSize: '0.6875rem', cursor: 'pointer', padding: 0, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}
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

                      {/* Reply form */}
                      <form onSubmit={handleReply}>
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
                            style={{ flex: 1, padding: '0.5rem 0.75rem', background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '8px', color: '#1a1a1a', fontSize: '0.875rem', outline: 'none', resize: 'none', lineHeight: 1.5 }}
                          />
                          <button
                            type="submit"
                            disabled={submittingReply || !replyContent.trim()}
                            style={{ padding: '0.5rem 0.875rem', background: submittingReply || !replyContent.trim() ? '#ddd' : '#1a1a1a', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: submittingReply || !replyContent.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                          >
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

        {/* SIDEBAR */}
        {!isMobile && (
          <aside style={{ position: 'sticky', top: '5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Video card */}
            <div style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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
                <div style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '1.25rem 1.25rem 1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#bbb', fontWeight: 600, textTransform: 'uppercase' as const, marginBottom: '4px' }}>Your Journey</div>
                    <div style={{ fontSize: '0.75rem', color: '#999', lineHeight: 1.5 }}>Track your progress here and compare it to your life elevation outside the Circle.</div>
                  </div>
                  <div style={{ position: 'relative', height: '48px' }}>
                    <div style={{ position: 'absolute', top: '9px', left: 0, right: 0, height: '2px', background: '#e0e0e0', borderRadius: '1px' }} />
                    <div style={{ position: 'absolute', top: '9px', left: 0, height: '2px', width: `${fillPercent}%`, background: 'linear-gradient(90deg, #5a9e6e, #3d7a52)', borderRadius: '1px', transition: 'width 0.8s ease' }} />
                    {stages.map((stage, index) => {
                      const isCurrent = index === currentIndex
                      const isCompleted = index < currentIndex
                      const posPercent = (index / 3) * 100
                      const isFirst = index === 0
                      const isLast = index === 3
                      return (
                        <div key={stage} style={{ position: 'absolute', left: `${posPercent}%`, top: 0, transform: isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center' }}>
                          <div className={isCurrent ? 'journey-pulse-dot' : ''} style={{ width: '11px', height: '11px', borderRadius: '50%', background: isCurrent ? '#4a9e5c' : isCompleted ? '#4a9e5c' : '#ffffff', border: `2px solid ${isCurrent || isCompleted ? '#4a9e5c' : '#d0d0d0'}`, position: 'relative', zIndex: 1 }} />
                          <div style={{ marginTop: '8px', fontSize: '0.68rem', color: isCurrent ? '#1a1a1a' : isCompleted ? '#4a9e5c' : '#bbb', fontWeight: isCurrent ? 600 : 400, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{stage}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Quick links */}
            <div style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#bbb', marginBottom: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Quick Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <a href="/videos" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0', borderBottom: '1px solid #f2f2f2', fontFamily: GAMBARINO }}>Video Library</a>
                <a href="/calls" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0', fontFamily: GAMBARINO }}>Live Call Calendar</a>
              </div>
            </div>
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
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0 0 6px 6px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.5rem 0', fontFamily: GAMBARINO }}>{nextVideo?.title}</h2>
              {nextVideo?.description && <p style={{ fontSize: '0.875rem', color: '#666', margin: 0, lineHeight: 1.6 }}>{nextVideo.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
