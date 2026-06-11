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

export default function CommunityPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [continueHovered, setContinueHovered] = useState(false)

  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Introductions' })
  const [posting, setPosting] = useState(false)
  const [postFocused, setPostFocused] = useState(false)

  const [activeCategory, setActiveCategory] = useState('All')

  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  const [expandedPostId, setExpandedPostId] = useState<number | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  const [replyingToId, setReplyingToId] = useState<number | null>(null)

  const [announcement, setAnnouncement] = useState<{ id: number; title: string; body: string; url: string } | null>(null)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [notifLoaded, setNotifLoaded] = useState(false)

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

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
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

  const Avatar = ({ name, photo, size = 32 }: { name: string, photo?: string | null, size?: number }) => (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: photo ? `url(${photo})` : 'var(--kyn-blue-bg)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--kyn-blue)', fontSize: `${size * 0.34}px`, fontWeight: 700,
      flexShrink: 0, fontFamily: 'var(--kyn-font-serif)',
      border: '1px solid var(--kyn-border)'
    }}>
      {!photo && name?.charAt(0).toUpperCase()}
    </div>
  )

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--kyn-ink3)', fontFamily: 'var(--kyn-font-sans)', fontSize: '14px' }}>Loading…</div>
      </div>
    )
  }

  const youtubeId = nextVideo ? getYouTubeId(nextVideo) : null
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null

  const renderVideoCard = () => (
    <>
      {showVideoPlayer && youtubeId ? (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--kyn-r)', background: '#000' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <button onClick={() => setIsVideoExpanded(true)} style={{ flex: 1, padding: '6px', background: 'var(--kyn-surface-raised)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r)', color: 'var(--kyn-ink2)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--kyn-font-sans)' }}>↗ Expand</button>
            <button onClick={() => { setShowVideoPlayer(false); setIsVideoExpanded(false) }} style={{ padding: '6px 12px', background: 'var(--kyn-surface-raised)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r)', color: 'var(--kyn-ink3)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--kyn-font-sans)' }}>✕</button>
          </div>
        </div>
      ) : thumbnailUrl ? (
        <div onClick={() => youtubeId && setShowVideoPlayer(true)} style={{ width: '100%', height: '130px', borderRadius: 'var(--kyn-r)', marginBottom: '12px', cursor: 'pointer', position: 'relative', overflow: 'hidden', border: '1px solid var(--kyn-border)' }}>
          <img src={thumbnailUrl} alt={nextVideo?.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.18)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', paddingLeft: '3px' }}>▶</div>
          </div>
        </div>
      ) : null}
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: 'var(--kyn-green)', marginBottom: '3px', fontFamily: 'var(--kyn-font-sans)' }}>Continue Your Journey</div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--kyn-ink)', margin: '0 0 3px 0', fontFamily: 'var(--kyn-font-serif)', lineHeight: 1.35 }}>
        {nextVideo?.title || 'Start Here'}
      </h3>
      {nextVideo?.duration && <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)', marginBottom: '10px', fontFamily: 'var(--kyn-font-sans)' }}>{nextVideo.duration} min</div>}
      <button
        onClick={() => router.push(nextVideo ? `/videos/${nextVideo.id}` : '/videos')}
        style={{ padding: '7px 14px', background: continueHovered ? 'var(--kyn-green)' : 'var(--kyn-green-bg)', border: '1px solid var(--kyn-border-green)', color: continueHovered ? '#fff' : 'var(--kyn-green)', fontSize: '12px', fontWeight: 600, borderRadius: 'var(--kyn-r)', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'var(--kyn-font-sans)' }}
        onMouseEnter={() => setContinueHovered(true)}
        onMouseLeave={() => setContinueHovered(false)}
      >
        Continue →
      </button>
    </>
  )

  const renderJourneyWidget = () => {
    const stages = ['Seeker', 'Explorer', 'Pathfinder', 'Guide']
    const currentIndex = Math.max(0, stages.indexOf(user?.level || 'Seeker'))
    const overallProgress = (user as any)?.progress ?? 0
    const levelMin = currentIndex * 25
    const levelProgress = currentIndex === 3 ? 100 : Math.max(0, Math.min(100, ((overallProgress - levelMin) / 25) * 100))
    const fillPercent = Math.min(100, (currentIndex / 3) * 100 + (levelProgress / 3))
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'var(--kyn-green)', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: '3px', fontFamily: 'var(--kyn-font-sans)' }}>Your Journey</div>
          <div style={{ fontSize: '11.5px', color: 'var(--kyn-ink3)', lineHeight: 1.5, fontFamily: 'var(--kyn-font-sans)' }}>Track your progress here and compare it to your life elevation outside the Circle.</div>
        </div>
        <div style={{ position: 'relative', height: '48px' }}>
          <div style={{ position: 'absolute', top: '9px', left: 0, right: 0, height: '2px', background: 'var(--kyn-border)', borderRadius: '1px' }} />
          <div style={{ position: 'absolute', top: '9px', left: 0, height: '2px', width: `${fillPercent}%`, background: 'linear-gradient(90deg, var(--kyn-green), var(--kyn-green-hi))', borderRadius: '1px', transition: 'width 0.8s ease' }} />
          {stages.map((stage, index) => {
            const isCurrent = index === currentIndex
            const isCompleted = index < currentIndex
            const posPercent = (index / 3) * 100
            const isFirst = index === 0
            const isLast = index === 3
            return (
              <div key={stage} style={{ position: 'absolute', left: `${posPercent}%`, top: 0, transform: isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center' }}>
                <div className={isCurrent ? 'journey-pulse-dot' : ''} style={{
                  width: '11px', height: '11px', borderRadius: '50%',
                  background: isCurrent ? 'var(--kyn-green)' : isCompleted ? 'var(--kyn-green)' : 'var(--kyn-surface-raised)',
                  border: `2px solid ${isCurrent || isCompleted ? 'var(--kyn-green)' : 'var(--kyn-border-mid)'}`,
                  boxShadow: isCurrent ? '0 0 0 3px var(--kyn-green-mid)' : 'none',
                  position: 'relative', zIndex: 1
                }} />
                <div style={{ marginTop: '7px', fontSize: '0.67rem', color: isCurrent ? 'var(--kyn-green)' : isCompleted ? 'var(--kyn-green)' : 'var(--kyn-ink3)', fontWeight: isCurrent ? 700 : 400, whiteSpace: 'nowrap', letterSpacing: '0.02em', fontFamily: 'var(--kyn-font-sans)' }}>{stage}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', fontFamily: 'var(--kyn-font-sans)' }}>
      <style>{`
        * { box-sizing: border-box; }
        textarea { font-family: var(--kyn-font-sans); }
        select { font-family: var(--kyn-font-sans); }
        textarea::placeholder { color: var(--kyn-ink3) !important; }
        input::placeholder { color: var(--kyn-ink3) !important; }
        select option { background: #fff; color: var(--kyn-ink); }
      `}</style>

      {/* Announcement popup */}
      {announcement && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'var(--kyn-surface)', borderRadius: 'var(--kyn-r-lg)', maxWidth: '480px', width: '100%', padding: '2rem', border: '1px solid var(--kyn-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative' }}>
            <button onClick={() => { localStorage.setItem('dismissed_announcement', String(announcement.id)); setAnnouncement(null) }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--kyn-ink3)', cursor: 'pointer', lineHeight: 1 }}>×</button>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: 'var(--kyn-green)', marginBottom: '12px', fontFamily: 'var(--kyn-font-sans)' }}>From Mason</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--kyn-ink)', marginBottom: '12px', lineHeight: 1.4, fontFamily: 'var(--kyn-font-serif)' }}>{announcement.title}</h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--kyn-ink2)', marginBottom: '1.5rem', fontFamily: 'var(--kyn-font-sans)' }}>{announcement.body}</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {announcement.url && announcement.url !== '/members' && (
                <a href={announcement.url} onClick={() => { localStorage.setItem('dismissed_announcement', String(announcement.id)); setAnnouncement(null) }} style={{ flex: 1, display: 'block', textAlign: 'center' as const, padding: '11px', background: 'var(--kyn-green)', color: '#fff', borderRadius: 'var(--kyn-r)', fontWeight: 700, fontSize: '14px', textDecoration: 'none', fontFamily: 'var(--kyn-font-sans)' }}>View Now</a>
              )}
              <button onClick={() => { localStorage.setItem('dismissed_announcement', String(announcement.id)); setAnnouncement(null) }} style={{ flex: 1, padding: '11px', background: 'var(--kyn-surface-raised)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r)', color: 'var(--kyn-ink2)', fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--kyn-font-sans)' }}>Got it</button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: '1160px', margin: '0 auto',
        padding: isMobile ? '16px 14px 24px' : '28px 32px',
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: '1fr 288px',
        gap: '20px',
        alignItems: 'start'
      }}>

        {/* LEFT COLUMN */}
        <div>
          {/* Page heading */}
          <h1 style={{ fontFamily: 'var(--kyn-font-serif)', fontSize: '22px', fontWeight: 400, color: 'var(--kyn-ink)', marginBottom: '20px', lineHeight: 1.3 }}>
            Brotherhood
          </h1>

          {/* Video card - mobile only */}
          {isMobile && (
            <div style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', padding: '14px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {renderVideoCard()}
            </div>
          )}

          {/* Journey progress - mobile only */}
          {isMobile && (
            <div style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', padding: '14px 14px 18px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {renderJourneyWidget()}
            </div>
          )}

          {/* Post Composer */}
          <div style={{
            background: 'var(--kyn-surface)',
            border: '1px solid var(--kyn-border)',
            borderRadius: 'var(--kyn-r-lg)',
            padding: '14px',
            marginBottom: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Avatar name={user?.name || ''} size={34} />
              <div style={{ flex: 1 }}>
                {!postFocused ? (
                  <div
                    onClick={() => setPostFocused(true)}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--kyn-surface-raised)',
                      border: '1px solid var(--kyn-border)',
                      borderRadius: 'var(--kyn-r)',
                      color: 'var(--kyn-ink3)',
                      fontSize: '14px',
                      cursor: 'text',
                      userSelect: 'none'
                    }}
                  >
                    What's alive in you today?
                  </div>
                ) : (
                  <form onSubmit={handleCreatePost}>
                    <div style={{ marginBottom: '8px' }}>
                      <select
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        style={{
                          padding: '5px 10px', background: 'var(--kyn-surface-raised)',
                          border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r)',
                          color: 'var(--kyn-ink2)', fontSize: '12.5px', outline: 'none'
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
                        width: '100%', padding: '6px 0', background: 'transparent',
                        border: 'none', borderBottom: '1px solid var(--kyn-border)',
                        color: 'var(--kyn-ink)', fontSize: '15px', fontWeight: 600,
                        outline: 'none', marginBottom: '8px', fontFamily: 'var(--kyn-font-serif)'
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
                        width: '100%', padding: '6px 0', background: 'transparent',
                        border: 'none', color: 'var(--kyn-ink)', fontSize: '14px',
                        outline: 'none', resize: 'vertical', lineHeight: 1.6
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--kyn-border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>{newPost.content.length}/10000</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => { setPostFocused(false); setNewPost({ title: '', content: '', category: 'Introductions' }) }}
                          style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r)', color: 'var(--kyn-ink3)', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={posting || newPost.content.length < 10}
                          style={{
                            padding: '6px 16px', minHeight: '36px',
                            background: posting || newPost.content.length < 10 ? 'var(--kyn-border)' : 'var(--kyn-green)',
                            border: 'none', borderRadius: 'var(--kyn-r)',
                            color: posting || newPost.content.length < 10 ? 'var(--kyn-ink3)' : '#fff',
                            fontSize: '12.5px', fontWeight: 700,
                            cursor: posting || newPost.content.length < 10 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {posting ? 'Posting…' : 'Post'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' as any }}>
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '5px 13px',
                  background: activeCategory === cat ? 'var(--kyn-green-bg)' : 'var(--kyn-surface)',
                  border: `1px solid ${activeCategory === cat ? 'var(--kyn-border-green)' : 'var(--kyn-border)'}`,
                  borderRadius: '20px',
                  color: activeCategory === cat ? 'var(--kyn-green)' : 'var(--kyn-ink2)',
                  fontSize: '12.5px', fontWeight: activeCategory === cat ? 600 : 400,
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
              background: 'var(--kyn-green-bg)',
              border: '1px solid var(--kyn-border-green)',
              borderLeft: '3px solid var(--kyn-green)',
              borderRadius: 'var(--kyn-r)',
              padding: '12px 14px',
              marginBottom: '14px',
              fontSize: '13.5px',
              color: 'var(--kyn-ink2)',
              lineHeight: 1.6,
              fontFamily: 'var(--kyn-font-sans)'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--kyn-ink)' }}>Introduce yourself.</span> Who you are, what pulled you here, what you're wanting to shift.
            </div>
          )}

          {/* Posts Feed */}
          {posts.filter(p => activeCategory === 'All' || p.category === activeCategory).length === 0 ? (
            <div style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ color: 'var(--kyn-ink3)', margin: '0 0 1rem 0', fontFamily: 'var(--kyn-font-sans)', fontSize: '14px' }}>
                {activeCategory === 'All' ? 'No posts yet. Be the first to share.' : `No posts in ${activeCategory} yet.`}
              </p>
              <button onClick={() => setPostFocused(true)} style={{ padding: '8px 20px', background: 'var(--kyn-green)', border: 'none', color: '#fff', borderRadius: 'var(--kyn-r)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                Create a Post
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {posts
                .filter(p => activeCategory === 'All' || p.category === activeCategory)
                .map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: 'var(--kyn-surface)',
                    border: '1px solid var(--kyn-border)',
                    borderRadius: 'var(--kyn-r-lg)',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 10px rgba(0,0,0,0.02)',
                    transition: 'box-shadow 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 10px rgba(0,0,0,0.02)')}
                >
                  <div style={{ padding: '16px 18px 12px' }}>
                    {/* Author row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <Avatar name={post.user_name} photo={post.user_photo} size={32} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--kyn-ink)' }}>{post.user_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {getTimeAgo(post.created_at)}
                          {post.category && (
                            <>
                              <span style={{ color: 'var(--kyn-border-mid)' }}>·</span>
                              <span style={{ color: 'var(--kyn-green)', fontWeight: 600 }}>{post.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Post content */}
                    {post.title && (
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--kyn-ink)', margin: '0 0 5px 0', fontFamily: 'var(--kyn-font-serif)', lineHeight: 1.35 }}>
                        {post.title}
                      </h3>
                    )}
                    <p style={{ fontSize: '13.5px', color: 'var(--kyn-ink2)', lineHeight: 1.6, margin: '0 0 10px 0', whiteSpace: 'pre-wrap' }}>
                      {expandedPostId === post.id ? post.content : (
                        post.content.length > 280 ? post.content.substring(0, 280) + '…' : post.content
                      )}
                    </p>

                    {/* Action bar */}
                    <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid var(--kyn-border)', paddingTop: '8px' }}>
                      <button
                        onClick={(e) => handleLike(e, post.id)}
                        style={{
                          flex: 1, minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                          background: 'transparent', border: 'none', padding: '6px',
                          fontSize: '12.5px', fontWeight: 500,
                          color: likedPosts.has(post.id) ? 'var(--kyn-green)' : 'var(--kyn-ink3)',
                          cursor: 'pointer', borderRadius: 'var(--kyn-r)', transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--kyn-green-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {likedPosts.has(post.id) ? '♥' : '♡'} {post.like_count || ''}
                      </button>
                      <button
                        onClick={() => handleToggleComments(post)}
                        style={{
                          flex: 1, minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                          background: expandedPostId === post.id ? 'var(--kyn-blue-bg)' : 'transparent',
                          border: 'none', padding: '6px',
                          fontSize: '12.5px', fontWeight: 500,
                          color: expandedPostId === post.id ? 'var(--kyn-blue)' : 'var(--kyn-blue)',
                          cursor: 'pointer', borderRadius: 'var(--kyn-r)', transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--kyn-blue-bg)'}
                        onMouseLeave={(e) => { if (expandedPostId !== post.id) e.currentTarget.style.background = 'transparent' }}
                      >
                        ↩ {post.reply_count > 0 ? `${post.reply_count} ${post.reply_count === 1 ? 'comment' : 'comments'}` : 'Comment'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Comments */}
                  {((post.replies && post.replies.length > 0) || expandedPostId === post.id) && (
                    <div style={{ borderTop: '1px solid var(--kyn-border)', background: 'var(--kyn-surface-raised)', padding: '12px 18px' }}>
                      {loadingReplies && expandedPostId === post.id ? (
                        <p style={{ color: 'var(--kyn-ink3)', fontSize: '13px', margin: 0 }}>Loading comments…</p>
                      ) : (
                        (() => {
                          const allInlineReplies = post.replies || []
                          const displayReplies = expandedPostId === post.id ? replies : allInlineReplies.slice(0, 3)
                          const hasMoreReplies = expandedPostId !== post.id && allInlineReplies.length > 3
                          return displayReplies.length === 0 ? null : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                              {buildReplyTree(displayReplies).map((reply) => {
                                const renderReply = (r: Reply, depth: number) => (
                                  <div key={r.id} style={{ marginLeft: depth > 0 ? '24px' : '0', marginBottom: '4px' }}>
                                    <div style={{
                                      padding: '10px 12px',
                                      background: 'var(--kyn-surface)',
                                      borderRadius: 'var(--kyn-r)',
                                      border: '1px solid var(--kyn-border)',
                                      borderLeft: depth > 0 ? '2px solid var(--kyn-border-mid)' : '2px solid var(--kyn-border)'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                                        <Avatar name={r.user_name} photo={r.user_photo} size={24} />
                                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--kyn-ink)' }}>{r.user_name}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>{getTimeAgo(r.created_at)}</span>
                                      </div>
                                      <p style={{ fontSize: '13px', color: 'var(--kyn-ink2)', lineHeight: 1.55, margin: '0 0 5px 0', whiteSpace: 'pre-wrap' }}>{r.content}</p>
                                      {depth < 3 && (
                                        <button
                                          onClick={() => setReplyingToId(replyingToId === r.id ? null : r.id)}
                                          style={{ background: 'none', border: 'none', color: replyingToId === r.id ? 'var(--kyn-green)' : 'var(--kyn-ink3)', fontSize: '11px', cursor: 'pointer', padding: 0, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}
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
                                <button onClick={() => handleToggleComments(post)} style={{ background: 'none', border: 'none', color: 'var(--kyn-blue)', fontSize: '12.5px', cursor: 'pointer', padding: '2px 0', fontFamily: 'var(--kyn-font-sans)', textAlign: 'left' as const, fontWeight: 600 }}>
                                  See all {post.reply_count} comments →
                                </button>
                              )}
                            </div>
                          )
                        })()
                      )}

                      {/* Reply form */}
                      {expandedPostId === post.id && (
                        <form onSubmit={handleReply}>
                          {replyingToId && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', background: 'var(--kyn-green-bg)', border: '1px solid var(--kyn-border-green)', borderRadius: 'var(--kyn-r)', marginBottom: '8px', fontSize: '11.5px', color: 'var(--kyn-green)' }}>
                              <span>Replying to {replies.find(r => r.id === replyingToId)?.user_name || 'comment'}</span>
                              <button type="button" onClick={() => setReplyingToId(null)} style={{ background: 'none', border: 'none', color: 'var(--kyn-green)', cursor: 'pointer', fontSize: '14px', padding: 0 }}>✕</button>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <Avatar name={user?.name || ''} size={26} />
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={replyingToId ? 'Write a reply…' : 'Write a comment…'}
                              rows={1}
                              onFocus={(e) => e.currentTarget.rows = 3}
                              onBlur={(e) => { if (!replyContent) e.currentTarget.rows = 1 }}
                              style={{ flex: 1, padding: '7px 10px', background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r)', color: 'var(--kyn-ink)', fontSize: '13px', outline: 'none', resize: 'none', lineHeight: 1.5 }}
                            />
                            <button
                              type="submit"
                              disabled={submittingReply || !replyContent.trim()}
                              style={{ padding: '7px 12px', background: submittingReply || !replyContent.trim() ? 'var(--kyn-border)' : 'var(--kyn-green)', border: 'none', borderRadius: 'var(--kyn-r)', color: submittingReply || !replyContent.trim() ? 'var(--kyn-ink3)' : '#fff', fontSize: '12.5px', fontWeight: 700, cursor: submittingReply || !replyContent.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', minHeight: '36px' }}
                            >
                              {submittingReply ? '…' : 'Post'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR — desktop only */}
        {!isMobile && (
          <aside style={{ position: 'sticky', top: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Video card */}
            <div style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {renderVideoCard()}
            </div>

            {/* Journey progress */}
            <div style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', padding: '14px 14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {renderJourneyWidget()}
            </div>

            {/* Quick links */}
            <div style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'var(--kyn-green)', marginBottom: '10px', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--kyn-font-sans)' }}>Quick Links</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <a href="/videos" style={{ color: 'var(--kyn-ink2)', fontSize: '13.5px', textDecoration: 'none', padding: '7px 0', borderBottom: '1px solid var(--kyn-border)', fontFamily: 'var(--kyn-font-sans)' }}>Video Library</a>
                <a href="/calls" style={{ color: 'var(--kyn-ink2)', fontSize: '13.5px', textDecoration: 'none', padding: '7px 0', fontFamily: 'var(--kyn-font-sans)' }}>Live Call Calendar</a>
              </div>
            </div>

            {/* Email notification toggle */}
            {notifLoaded && (
              <div style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'var(--kyn-green)', marginBottom: '10px', fontWeight: 700, textTransform: 'uppercase' as const, fontFamily: 'var(--kyn-font-sans)' }}>Notifications</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--kyn-ink2)', marginBottom: '2px', fontFamily: 'var(--kyn-font-sans)' }}>Community emails</div>
                    <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)', fontFamily: 'var(--kyn-font-sans)' }}>{emailNotifications ? 'New posts and replies' : 'Off'}</div>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    aria-label={emailNotifications ? 'Disable email notifications' : 'Enable email notifications'}
                    style={{
                      flexShrink: 0, width: '40px', height: '22px', borderRadius: '11px',
                      background: emailNotifications ? 'var(--kyn-green)' : 'var(--kyn-border-mid)',
                      border: 'none', cursor: 'pointer', position: 'relative',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: emailNotifications ? '21px' : '3px',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '1rem' : '2rem' }} onClick={() => setIsVideoExpanded(false)}>
          <div style={{ maxWidth: '1200px', width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: '-3rem', right: 0, display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsVideoExpanded(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '12.5px', cursor: 'pointer', padding: '6px 14px', borderRadius: 'var(--kyn-r)' }}>↙ Back</button>
              <button onClick={() => { setShowVideoPlayer(false); setIsVideoExpanded(false) }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '12.5px', cursor: 'pointer', padding: '6px 14px', borderRadius: 'var(--kyn-r)' }}>✕ Close</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--kyn-r-lg)' }}>
              <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
            <div style={{ background: 'var(--kyn-surface)', padding: '1.25rem', borderRadius: '0 0 var(--kyn-r-lg) var(--kyn-r-lg)', border: '1px solid var(--kyn-border)', borderTop: 'none' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--kyn-ink)', margin: '0 0 6px 0', fontFamily: 'var(--kyn-font-serif)' }}>{nextVideo?.title}</h2>
              {nextVideo?.description && <p style={{ fontSize: '13.5px', color: 'var(--kyn-ink2)', margin: 0, lineHeight: 1.6 }}>{nextVideo.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
