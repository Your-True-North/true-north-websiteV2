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
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null)
  const [continueHovered, setContinueHovered] = useState(false)

  // New post modal state
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Introductions' })
  const [posting, setPosting] = useState(false)

  // Like tracking
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  // Post detail modal state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPostDetail, setShowPostDetail] = useState(false)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [detailLiked, setDetailLiked] = useState(false)

  // Video state
  const [nextVideo, setNextVideo] = useState<Video | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

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

  // Fetch post detail with replies
  const handlePostClick = async (post: Post) => {
    setSelectedPost(post)
    setShowPostDetail(true)
    setLoadingReplies(true)
    setDetailLiked(likedPosts.has(post.id))
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

  // Like handler for detail modal
  const handleDetailLike = async () => {
    if (!user || !selectedPost) return
    try {
      const res = await fetch(`/api/forum/posts/${selectedPost.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      if (res.ok) {
        const data = await res.json()
        setDetailLiked(data.liked)
        setLikedPosts(prev => {
          const next = new Set(prev)
          if (data.liked) { next.add(selectedPost.id) } else { next.delete(selectedPost.id) }
          return next
        })
        // Refresh the post detail to get updated count
        const postRes = await fetch(`/api/forum/posts/${selectedPost.id}`)
        const postData = await postRes.json()
        if (postRes.ok && postData.post) {
          setSelectedPost(postData.post)
        }
        fetchPosts()
      }
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  // Reply handler
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPost || !replyContent.trim()) return
    setSubmittingReply(true)
    try {
      const res = await fetch(`/api/forum/posts/${selectedPost.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, content: replyContent })
      })
      if (res.ok) {
        const data = await res.json()
        setReplies(prev => [...prev, { ...data.reply, user_name: user.name, user_photo: null }])
        setReplyContent('')
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
  const youtubeId = nextVideo ? getYouTubeId(nextVideo) : null
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null

  // Shared video card content
  const renderVideoCard = (height: string) => (
    <>
      {thumbnailUrl ? (
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
      {/* Hero Section */}
      <div style={{ background: '#545454', padding: '2rem 0', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} style={{
                  color: link.label === 'Community' ? '#e67e22' : '#cccccc',
                  fontSize: '0.9375rem',
                  fontWeight: link.label === 'Community' ? 600 : 500,
                  textDecoration: 'none', transition: 'color 0.2s ease',
                  borderBottom: link.label === 'Community' ? '2px solid #e67e22' : '2px solid transparent',
                  paddingBottom: '0.25rem'
                }}>
                  {link.label}
                </Link>
              ))}
            </div>
            <Link href="/members" style={{ color: '#cccccc', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
              {user?.name || 'Profile'}
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontFamily: 'Gambarino, serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Welcome back, {user?.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem' }}>{currentLevel}</span>
              {nextLevel && (
                <>
                  <span style={{ color: '#999', fontSize: '1rem' }}>→</span>
                  <span style={{ color: '#999999', fontWeight: 400, fontSize: '1rem' }}>{nextLevel}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 3rem',
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
        gap: '2rem', alignItems: 'start'
      }}>
        {/* Community Feed */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Gambarino, serif', fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              Community Feed
            </h2>
            <button onClick={() => setShowNewPostModal(true)} style={{
              padding: '0.625rem 1.25rem', background: '#e67e22', border: 'none',
              borderRadius: '4px', color: '#ffffff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
            }}>
              + New Post
            </button>
          </div>

          {/* Mobile Toggle */}
          {isMobile && (
            <button onClick={() => setShowVideoCard(!showVideoCard)} style={{
              width: '100%', padding: '0.875rem 1.25rem', background: '#e67e22',
              border: 'none', borderRadius: '6px', color: '#ffffff',
              fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
              marginBottom: '1.5rem', textAlign: 'center'
            }}>
              Next Teaching
            </button>
          )}

          {/* Mobile Video Card */}
          {isMobile && showVideoCard && (
            <div style={{ background: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '6px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              {renderVideoCard('160px')}
            </div>
          )}

          {/* Posts List */}
          {posts.length === 0 ? (
            <div style={{ background: '#ffffff', border: '2px solid #e5e5e5', borderRadius: '6px', padding: '3rem 2rem', textAlign: 'center' }}>
              <p style={{ color: '#666', margin: '0 0 1rem 0' }}>No posts yet. Be the first to share!</p>
              <button onClick={() => setShowNewPostModal(true)} style={{
                padding: '0.75rem 1.5rem', background: '#e67e22', border: 'none',
                color: '#ffffff', borderRadius: '4px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
              }}>
                Create a Post
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map((post) => (
                <div key={post.id} style={{
                  background: '#ffffff',
                  border: `2px solid ${hoveredPostId === post.id ? '#666' : '#e5e5e5'}`,
                  borderRadius: '6px', padding: '1.5rem',
                  transition: 'border-color 0.2s ease', cursor: 'pointer'
                }}
                  onMouseEnter={() => setHoveredPostId(post.id)}
                  onMouseLeave={() => setHoveredPostId(null)}
                >
                  {/* Clickable post area - opens detail modal */}
                  <div onClick={() => handlePostClick(post)}>
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
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>{post.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>
                          {getTimeAgo(post.created_at)}{post.category && ` · ${post.category}`}
                        </div>
                      </div>
                    </div>
                    {post.title && (
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#e67e22', margin: '0 0 0.5rem 0' }}>
                        {post.title}
                      </h3>
                    )}
                    <p style={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.6, margin: '0 0 0.75rem 0' }}>
                      {post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}
                    </p>
                  </div>

                  {/* Post Actions */}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: '#999', alignItems: 'center' }}>
                    <button onClick={(e) => handleLike(e, post.id)} style={{
                      background: likedPosts.has(post.id) ? 'rgba(230, 126, 34, 0.1)' : 'transparent',
                      border: `1px solid ${likedPosts.has(post.id) ? '#e67e22' : '#e5e5e5'}`,
                      borderRadius: '4px', padding: '0.375rem 0.75rem', fontSize: '0.8125rem',
                      color: likedPosts.has(post.id) ? '#e67e22' : '#999',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem',
                      transition: 'all 0.2s ease'
                    }}>
                      {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                    </button>
                    <button onClick={() => handlePostClick(post)} style={{
                      background: 'transparent', border: '1px solid #e5e5e5',
                      borderRadius: '4px', padding: '0.375rem 0.75rem', fontSize: '0.8125rem',
                      color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem',
                      transition: 'all 0.2s ease'
                    }}>
                      💬 {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Desktop only */}
        {!isMobile && (
          <aside style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ background: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '6px', padding: '1.5rem' }}>
              {renderVideoCard('150px')}
            </div>
            <div style={{ background: '#ffffff', border: '2px solid #e5e5e5', borderRadius: '6px', padding: '1.5rem', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#666', margin: '0 0 1rem 0' }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/forum" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>Forum</Link>
                <Link href="/videos" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>Video Library</Link>
                <Link href="/calls" style={{ color: '#333', fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem 0' }}>Live Calls</Link>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Post Detail Modal */}
      {showPostDetail && selectedPost && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '2rem', overflow: 'auto'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowPostDetail(false); setReplyContent('') } }}
        >
          <div style={{
            background: '#ffffff', borderRadius: '6px', maxWidth: '800px', width: '100%',
            maxHeight: '90vh', overflow: 'auto', padding: '2rem', marginTop: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={() => { setShowPostDetail(false); setReplyContent('') }} style={{
                background: 'none', border: 'none', fontSize: '1.5rem', color: '#999', cursor: 'pointer', padding: '0.25rem'
              }}>✕</button>
            </div>

            {/* Post author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: selectedPost.user_photo ? `url(${selectedPost.user_photo})` : 'linear-gradient(135deg, #e67e22, #d35400)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '18px', fontWeight: 600, flexShrink: 0
              }}>
                {!selectedPost.user_photo && selectedPost.user_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>{selectedPost.user_name}</div>
                <div style={{ fontSize: '0.8125rem', color: '#999' }}>
                  {getTimeAgo(selectedPost.created_at)}{selectedPost.category && ` · ${selectedPost.category}`}
                </div>
              </div>
            </div>

            {/* Post content */}
            {selectedPost.title && (
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 1rem 0' }}>
                {selectedPost.title}
              </h2>
            )}
            <p style={{ fontSize: '1rem', color: '#333', lineHeight: 1.7, margin: '0 0 1.5rem 0', whiteSpace: 'pre-wrap' }}>
              {selectedPost.content}
            </p>

            {/* Like button */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e5e5' }}>
              <button onClick={handleDetailLike} style={{
                background: detailLiked ? 'rgba(230, 126, 34, 0.1)' : '#fafafa',
                border: `1px solid ${detailLiked ? '#e67e22' : '#e5e5e5'}`,
                borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '0.875rem',
                color: detailLiked ? '#e67e22' : '#666', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                {detailLiked ? '❤️' : '🤍'} {selectedPost.like_count} {selectedPost.like_count === 1 ? 'like' : 'likes'}
              </button>
            </div>

            {/* Replies */}
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 1rem 0' }}>
              Replies ({loadingReplies ? '...' : replies.length})
            </h3>

            {loadingReplies ? (
              <p style={{ color: '#999', padding: '1rem 0' }}>Loading replies...</p>
            ) : replies.length === 0 ? (
              <p style={{ color: '#999', padding: '1rem 0', fontSize: '0.875rem' }}>No replies yet. Be the first to respond!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {replies.map((reply) => (
                  <div key={reply.id} style={{ padding: '1rem', background: '#fafafa', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: reply.user_photo ? `url(${reply.user_photo})` : 'linear-gradient(135deg, #e67e22, #d35400)',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '13px', fontWeight: 600, flexShrink: 0
                      }}>
                        {!reply.user_photo && reply.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>{reply.user_name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#999' }}>{getTimeAgo(reply.created_at)}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            <form onSubmit={handleReply} style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1.5rem' }}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={3}
                style={{
                  width: '100%', padding: '0.75rem', background: '#fafafa',
                  border: '1px solid #e5e5e5', borderRadius: '4px', color: '#1a1a1a',
                  fontSize: '0.9375rem', outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', marginBottom: '0.75rem'
                }}
              />
              <button type="submit" disabled={submittingReply || !replyContent.trim()} style={{
                padding: '0.625rem 1.25rem',
                background: submittingReply || !replyContent.trim() ? '#ccc' : '#e67e22',
                border: 'none', borderRadius: '4px', color: '#ffffff',
                fontSize: '0.875rem', fontWeight: 600,
                cursor: submittingReply || !replyContent.trim() ? 'not-allowed' : 'pointer'
              }}>
                {submittingReply ? 'Posting...' : 'Reply'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}
          onClick={() => setShowNewPostModal(false)}>
          <div style={{ maxWidth: '600px', width: '100%', background: '#ffffff', borderRadius: '6px', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 1.5rem 0' }}>New Post</h2>
            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>Category</label>
                <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '4px', color: '#1a1a1a', fontSize: '0.9375rem', outline: 'none' }}>
                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>Title (optional)</label>
                <input type="text" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '4px', color: '#1a1a1a', fontSize: '0.9375rem', outline: 'none' }}
                  placeholder="Give your post a title..." />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>Content *</label>
                <textarea value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required minLength={10} maxLength={10000} rows={6}
                  style={{ width: '100%', padding: '0.75rem', background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '4px', color: '#1a1a1a', fontSize: '0.9375rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="What's on your mind? (min 10 characters)" />
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>{newPost.content.length}/10000 characters</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={posting || newPost.content.length < 10} style={{
                  flex: 1, padding: '0.875rem',
                  background: posting || newPost.content.length < 10 ? '#ccc' : '#e67e22',
                  border: 'none', borderRadius: '4px', color: '#ffffff', fontSize: '0.9375rem', fontWeight: 600,
                  cursor: posting || newPost.content.length < 10 ? 'not-allowed' : 'pointer'
                }}>
                  {posting ? 'Posting...' : 'Post'}
                </button>
                <button type="button" onClick={() => setShowNewPostModal(false)} style={{
                  padding: '0.875rem 1.5rem', background: '#fafafa', border: '1px solid #e5e5e5',
                  borderRadius: '4px', color: '#666', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoPlayer && youtubeId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }}>
          <div style={{ maxWidth: '960px', width: '100%', position: 'relative' }}>
            <button onClick={() => setShowVideoPlayer(false)} style={{
              position: 'absolute', top: '-3rem', right: 0,
              background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem'
            }}>✕ Close</button>
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
