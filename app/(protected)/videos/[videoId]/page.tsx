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
  id: number
  content: string
  created_at: string
  user_id: number
  user_name: string
  profile_photo: string | null
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
  const [isMobile, setIsMobile] = useState(false)

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
    if (!video) return

    try {
      const userData = localStorage.getItem('user')
      const user = userData ? JSON.parse(userData) : null
      if (!user?.id) return

      const newCompleted = !video.completed
      const res = await fetch(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          completed: newCompleted,
          watchedSeconds: newCompleted ? 1 : 0,
          totalDuration: 1
        })
      })

      const data = await res.json()

      if (res.ok) {
        setVideo({ ...video, completed: data.progress?.completed ?? newCompleted })
        fetch('/api/progress/calculate')
      }
    } catch (error) {
      console.error('[Mark Complete] Error:', error)
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

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontWeight: 300 }}>Loading video...</div>
      </div>
    )
  }

  if (!video) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ color: '#999', fontWeight: 300 }}>Video not found</div>
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
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a' }}>
      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        borderBottom: '1px solid #e5e5e5',
        background: '#ffffff'
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
            color: '#1a1a1a',
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
              position: 'sticky',
        top: 0,
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
              background: '#f8f8f8',
              border: '1px solid #e5e5e5',
              borderRadius: '3px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
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
                    marginBottom: '0.5rem'
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
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: video.completed ? 'rgba(127, 176, 105, 0.2)' : 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                    border: video.completed ? '1px solid #7fb069' : 'none',
                    borderRadius: '3px',
                    color: video.completed ? '#7fb069' : '#000',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {video.completed ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>

              <p style={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: '#666',
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
                borderTop: '1px solid #e5e5e5'
              }}>
                <button
                  onClick={handleReaction}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: video.hasReacted ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                    border: '1px solid #e5e5e5',
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
              background: '#f8f8f8',
              border: '1px solid #e5e5e5',
              borderRadius: '3px',
              padding: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 400,
                marginBottom: '1.5rem'
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
                    background: '#ffffff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {comments.length === 0 ? (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#999'
                  }}>
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} style={{
                      display: 'flex',
                      gap: '1rem',
                      paddingBottom: '1.5rem',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: comment.profile_photo ? `url(${comment.profile_photo})` : 'linear-gradient(135deg, rgba(155, 196, 184, 0.3), rgba(127, 176, 105, 0.2))',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {!comment.profile_photo && (
                          <svg style={{ width: '20px', height: '20px', color: '#999' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>

                      {/* Comment Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontWeight: 500 }}>{comment.user_name}</span>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#999'
                          }}>
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{
                          color: '#333',
                          lineHeight: 1.6,
                          fontSize: '0.9375rem'
                        }}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div>
            <div style={{
              background: '#f8f8f8',
              border: '1px solid #e5e5e5',
              borderRadius: '3px',
              padding: '1.5rem',
              position: isMobile ? 'static' : 'sticky',
              top: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 400,
                marginBottom: '1.5rem'
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
                          border: '1px solid #e5e5e5',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f8f8f8'
                          e.currentTarget.style.borderColor = '#9bc4b8'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = '#e5e5e5'
                        }}
                        >
                          {/* Thumbnail */}
                          <div style={{
                            width: '120px',
                            height: '68px',
                            borderRadius: '4px',
                            background: '#000',
                            flexShrink: 0,
                            position: 'sticky',
        top: 0,
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
                              WebkitBoxOrient: 'vertical'
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
