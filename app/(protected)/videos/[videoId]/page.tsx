'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Video {
  id: number
  title: string
  description: string
  youtubeUrl: string
  youtubeId?: string
  category: string
  duration: string
  upload_date: string
  completed: boolean
  commentsCount: number
  reactionsCount: number
  hasReacted: boolean
  status: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: number
  user_name: string
  profile_photo: string | null
  parent_comment_id: string | null
  replies?: Comment[]
}

interface RelatedVideo {
  id: number
  title: string
  category: string
  duration: string
  youtubeUrl: string
}

export default function VideoPlayerPage() {
  const router = useRouter()
  const params = useParams()
  const videoId = params.videoId as string

  const [video, setVideo] = useState<Video | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const hide = () => {
      document.querySelectorAll('footer, [role="contentinfo"], [class*="footer"], [class*="Footer"]')
        .forEach((el) => ((el as HTMLElement).style.display = 'none'))
    }
    hide()
    setTimeout(hide, 100)
  }, [])

  useEffect(() => {
    // Check auth
    const userData = localStorage.getItem('user')
    if (!userData) {
      window.location.replace('/auth/login')
      return
    }

    fetchVideoData()
  }, [videoId])

  const fetchVideoData = async () => {
    try {
      // Fetch video details
      const videoRes = await fetch(`/api/videos/${videoId}`)
      const videoData = await videoRes.json()
      console.log('[DEBUG] Primary API response:', { ok: videoRes.ok, status: videoRes.status, data: videoData })

      if (videoRes.ok && videoData.video) {
        console.log('[DEBUG] Primary API succeeded, video:', videoData.video)
        setVideo(videoData.video)
        setRelatedVideos(videoData.relatedVideos || [])
      } else {
        // Fallback: fetch from admin videos API and find by ID
        console.log('[DEBUG] Primary API failed, trying fallback to admin API...')
        const adminRes = await fetch('/api/admin/videos')
        const adminData = await adminRes.json()
        console.log('[DEBUG] Admin API response:', { ok: adminRes.ok, videoCount: adminData.videos?.length, firstVideo: adminData.videos?.[0] })
        if (adminData.videos) {
          const foundVideo = adminData.videos.find((v: any) => v.id === parseInt(videoId))
          console.log('[DEBUG] Looking for videoId:', videoId, 'parseInt:', parseInt(videoId))
          console.log('[DEBUG] Found video:', foundVideo)
          console.log('[DEBUG] Video youtubeId field:', foundVideo?.youtubeId, 'youtubeUrl field:', foundVideo?.youtubeUrl)
          if (foundVideo) {
            // Map database fields to expected interface
            setVideo({
              id: foundVideo.id,
              title: foundVideo.title,
              description: foundVideo.description || '',
              youtubeUrl: foundVideo.youtubeUrl || '',
              youtubeId: foundVideo.youtubeId,
              category: foundVideo.category,
              duration: foundVideo.duration ? `${foundVideo.duration} min` : 'N/A',
              upload_date: foundVideo.uploaddate,
              completed: false,
              commentsCount: parseInt(foundVideo.comment_count) || 0,
              reactionsCount: parseInt(foundVideo.reaction_count) || 0,
              hasReacted: false,
              status: 'new'
            })
            // Get related videos from same category
            const related = adminData.videos
              .filter((v: any) => v.category === foundVideo.category && v.id !== foundVideo.id)
              .slice(0, 3)
              .map((v: any) => ({
                id: v.id,
                title: v.title,
                category: v.category,
                duration: v.duration ? `${v.duration} min` : 'N/A',
                youtubeUrl: v.youtubeUrl
              }))
            setRelatedVideos(related)
          }
        }
      }

      // Fetch comments
      const commentsRes = await fetch(`/api/videos/${videoId}/comments`)
      const commentsData = await commentsRes.json()

      if (commentsRes.ok) {
        setComments(commentsData.comments)
      }
    } catch (error) {
      console.error('[Video Player] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async () => {
    if (!video) return

    try {
      const method = video.hasReacted ? 'DELETE' : 'POST'
      const res = await fetch(`/api/videos/${videoId}/reactions`, { method })
      const data = await res.json()

      if (res.ok) {
        setVideo({
          ...video,
          hasReacted: data.hasReacted,
          reactionsCount: data.count
        })
      }
    } catch (error) {
      console.error('[Reaction] Error:', error)
    }
  }

  const handleMarkComplete = async () => {
    if (!video || markingComplete) return

    const newCompleted = !video.completed
    setMarkingComplete(true)
    // Optimistic update — feels instant
    setVideo({ ...video, completed: newCompleted })

    try {
      const userData = localStorage.getItem('user')
      const user = userData ? JSON.parse(userData) : null

      if (!user?.id) {
        console.error('[Mark Complete] No user id in localStorage')
        setMarkingComplete(false)
        return
      }

      const res = await fetch(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, completed: newCompleted })
      })

      if (!res.ok) {
        // Revert on failure
        setVideo({ ...video, completed: !newCompleted })
        console.error('[Mark Complete] API error:', await res.text())
      }
    } catch (error) {
      setVideo({ ...video, completed: !newCompleted })
      console.error('[Mark Complete] Error:', error)
    } finally {
      setMarkingComplete(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    setSubmittingComment(true)

    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      const data = await res.json()

      if (res.ok) {
        setComments([data.comment, ...comments])
        setNewComment('')
        if (video) {
          setVideo({
            ...video,
            commentsCount: video.commentsCount + 1
          })
        }
      } else {
        alert(data.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('[Submit Comment] Error:', error)
      alert('Failed to post comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const buildCommentTree = (flat: Comment[]): Comment[] => {
    const map = new Map<string, Comment>()
    const roots: Comment[] = []
    flat.forEach(c => map.set(c.id, { ...c, replies: [] }))
    flat.forEach(c => {
      const node = map.get(c.id)!
      if (c.parent_comment_id && map.has(c.parent_comment_id)) {
        map.get(c.parent_comment_id)!.replies!.push(node)
      } else {
        roots.push(node)
      }
    })
    return roots
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId })
      })
      const data = await res.json()
      if (res.ok) {
        setComments(prev => [...prev, data.comment])
        setReplyContent('')
        setReplyingToId(null)
        if (video) setVideo({ ...video, commentsCount: video.commentsCount + 1 })
      } else {
        alert(data.error || 'Failed to post reply')
      }
    } catch {
      alert('Failed to post reply')
    } finally {
      setSubmittingComment(false)
    }
  }

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666', fontWeight: 300 }}>Loading video...</div>
      </div>
    )
  }

  if (!video) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ color: '#666', fontWeight: 300 }}>Video not found</div>
        <Link href="/videos" style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
          color: '#000',
          borderRadius: '3px',
          textDecoration: 'none',
          fontWeight: 600
        }}>
          Back to Library
        </Link>
      </div>
    )
  }

  // Use youtubeId directly if available, otherwise extract from URL
  const youtubeId = video.youtubeId || extractYouTubeId(video.youtubeUrl)

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0d', color: '#f0ede8' }}>
      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        borderBottom: '1px solid #242422',
        background: '#111110'
      }}>
        <div style={{
          maxWidth: '90rem',
          margin: '0 auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/videos" style={{
            fontSize: isMobile ? '1rem' : '1.5rem',
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: '#f0ede8',
            textDecoration: 'none'
          }}>
            CIRCLE OF RETURN
          </Link>
          <Link href="/videos" style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 300,
            border: '1px solid #9bc4b8',
            borderRadius: '3px',
            color: '#9bc4b8',
            textDecoration: 'none'
          }}>
            ← Back to Library
          </Link>
        </div>
      </nav>

      <div style={{
        maxWidth: '90rem',
        margin: '0 auto',
        padding: '1rem 1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 350px',
          gap: '2rem'
        }}>
          {/* Main Content */}
          <div>
            {/* Video Player */}
            <div style={{
              position: 'relative',
              paddingTop: '56.25%',
              background: '#000',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '1.5rem'
            }}>
              {youtubeId && (
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Video Info */}
            <div style={{
              background: '#1a1a18',
              border: '1px solid #2c2c2a',
              borderRadius: '6px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              position: isMobile ? 'static' : 'sticky',
              top: isMobile ? 'auto' : '4.5rem',
              zIndex: 10
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#9bc4b8',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {video.category}
                  </div>
                  <h1 style={{
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    fontWeight: 400,
                    marginBottom: '0.5rem',
                    color: '#f0ede8'
                  }}>
                    {video.title}
                  </h1>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#999'
                  }}>
                    <span>{video.duration}</span>
                    <span>•</span>
                    <span>{new Date(video.upload_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: video.completed ? 'rgba(127, 176, 105, 0.2)' : 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                    border: video.completed ? '1px solid #7fb069' : 'none',
                    borderRadius: '3px',
                    color: video.completed ? '#7fb069' : '#000',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: markingComplete ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    opacity: markingComplete ? 0.7 : 1
                  }}
                >
                  {markingComplete ? '...' : video.completed ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>

              <p style={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: '#a0a09c',
                marginBottom: '1.5rem'
              }}>
                {video.description}
              </p>

              {/* Reactions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #2c2c2a'
              }}>
                <button
                  onClick={handleReaction}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: video.hasReacted ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                    border: '1px solid #2c2c2a',
                    borderRadius: '3px',
                    color: video.hasReacted ? '#ef4444' : '#666',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>❤️</span>
                  <span>{video.reactionsCount}</span>
                </button>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#666'
                }}>
                  <svg style={{ width: '18px', height: '18px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span>{video.commentsCount} comments</span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div style={{
              background: '#1a1a18',
              border: '1px solid #2c2c2a',
              borderRadius: '6px',
              padding: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 400,
                marginBottom: '1.5rem',
                color: '#f0ede8'
              }}>
                Comments ({comments.length})
              </h2>

              {/* Add Comment Form */}
              <form onSubmit={handleSubmitComment} style={{ marginBottom: '2rem' }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  disabled={submittingComment}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '1rem',
                    background: '#252523',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    color: '#f0ede8',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    marginBottom: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: (!newComment.trim() || submittingComment) ? 'rgba(155, 196, 184, 0.3)' : 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                    border: 'none',
                    borderRadius: '3px',
                    color: '#000',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: (!newComment.trim() || submittingComment) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (() => {
                  const renderComment = (comment: Comment, depth: number): React.ReactNode => (
                    <div key={comment.id} style={{ marginLeft: depth > 0 ? '2rem' : '0' }}>
                      <div style={{
                        background: depth > 0 ? '#1e1e1c' : '#252523',
                        border: '1px solid ' + (depth > 0 ? '#2c2c2a' : '#333'),
                        borderLeft: depth > 0 ? '3px solid #9bc4b8' : '3px solid #3a3a38',
                        borderRadius: '8px',
                        padding: '0.875rem 1rem',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                            background: comment.profile_photo ? `url(${comment.profile_photo}) center/cover` : 'linear-gradient(135deg, rgba(155,196,184,0.5), rgba(127,176,105,0.3))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {!comment.profile_photo && <svg style={{ width: '14px', height: '14px', color: '#999' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f0ede8' }}>{comment.user_name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#555' }}>{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{ color: '#a0a09c', lineHeight: 1.6, fontSize: '0.9375rem', margin: '0 0 0.5rem 0' }}>{comment.content}</p>
                        {depth < 3 && (
                          <button
                            onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                            style={{ background: 'none', border: 'none', color: replyingToId === comment.id ? '#9bc4b8' : '#aaa', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}
                          >
                            {replyingToId === comment.id ? 'Cancel' : 'Reply'}
                          </button>
                        )}
                      </div>
                      {replyingToId === comment.id && (
                        <div style={{ marginLeft: depth > 0 ? '0' : '2rem', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write a reply..."
                              autoFocus
                              rows={2}
                              style={{ flex: 1, padding: '0.625rem 0.75rem', background: '#252523', border: '1px solid #333', borderRadius: '6px', color: '#f0ede8', fontSize: '0.875rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                            />
                            <button
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={submittingComment || !replyContent.trim()}
                              style={{ padding: '0.625rem 1rem', background: submittingComment || !replyContent.trim() ? '#2c2c2a' : 'linear-gradient(135deg, #9bc4b8, #7fb069)', border: 'none', borderRadius: '6px', color: submittingComment || !replyContent.trim() ? '#555' : '#000', fontSize: '0.8125rem', fontWeight: 600, cursor: submittingComment || !replyContent.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                            >
                              {submittingComment ? '...' : 'Post'}
                            </button>
                          </div>
                        </div>
                      )}
                      {comment.replies && comment.replies.length > 0 && (
                        <div>{comment.replies.map(r => renderComment(r, depth + 1))}</div>
                      )}
                    </div>
                  )
                  return buildCommentTree(comments).map(c => renderComment(c, 0))
                })()}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div>
            <div style={{
              background: '#1a1a18',
              border: '1px solid #2c2c2a',
              borderRadius: '6px',
              padding: '1.5rem',
              position: isMobile ? 'static' : 'sticky',
              top: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 400,
                marginBottom: '1.5rem',
                color: '#f0ede8'
              }}>
                Up Next
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {relatedVideos.length === 0 ? (
                  <div style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '0.875rem'
                  }}>
                    No related videos
                  </div>
                ) : (
                  relatedVideos.map(related => {
                    const relatedYoutubeId = extractYouTubeId(related.youtubeUrl)
                    return (
                      <Link
                        key={related.id}
                        href={`/videos/${related.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div style={{
                          display: 'flex',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          borderRadius: '3px',
                          border: '1px solid #2c2c2a',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#252523'
                          e.currentTarget.style.borderColor = '#9bc4b8'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = '#2c2c2a'
                        }}
                        >
                          {/* Thumbnail */}
                          <div style={{
                            width: '120px',
                            height: '68px',
                            borderRadius: '4px',
                            background: '#000',
                            flexShrink: 0,
                            overflow: 'hidden'
                          }}>
                            {relatedYoutubeId && (
                              <img
                                src={`https://img.youtube.com/vi/${relatedYoutubeId}/mqdefault.jpg`}
                                alt={related.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{
                              fontSize: '0.875rem',
                              fontWeight: 400,
                              marginBottom: '0.25rem',
                              lineHeight: 1.4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              color: '#f0ede8'
                            }}>
                              {related.title}
                            </h3>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#999'
                            }}>
                              {related.duration}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
