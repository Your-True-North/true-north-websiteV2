'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  name: string
}

interface Post {
  id: number
  title: string | null
  content: string
  category: string | null
  created_at: string
  user_name: string
  user_photo: string | null
  like_count: number
}

interface Reply {
  id: number
  content: string
  created_at: string
  user_name: string
  user_photo: string | null
  like_count: number
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.postId as string

  const [user, setUser] = useState<User | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/login')
      return
    }

    try {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      fetchPost()
    } catch (err) {
      router.push('/auth/login')
    }
  }, [router, postId])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/forum/posts/${postId}`)
      const data = await res.json()

      if (res.ok) {
        setPost(data.post)
        setReplies(data.replies)
      }
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch post:', err)
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !replyContent.trim()) return

    setPosting(true)

    try {
      const res = await fetch(`/api/forum/posts/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: replyContent
        })
      })

      if (res.ok) {
        setReplyContent('')
        fetchPost() // Refresh to show new reply
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to post reply')
      }
      setPosting(false)
    } catch (err) {
      console.error('Reply error:', err)
      alert('Something went wrong')
      setPosting(false)
    }
  }

  const handleLike = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        fetchPost() // Refresh like count
      }
    } catch (err) {
      console.error('Like error:', err)
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
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        Loading...
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        Post not found
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#1a1a1a', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Back Link */}
        <Link
          href="/forum"
          style={{
            color: '#9bc4b8',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '24px',
            display: 'inline-block'
          }}
        >
          ← Back to Forum
        </Link>

        {/* Original Post */}
        <div style={{
          padding: '32px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          marginBottom: '32px'
        }}>
          {/* Post Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: post.user_photo ? `url(${post.user_photo})` : 'linear-gradient(135deg, #9bc4b8, #7fb069)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a0a0a',
              fontSize: '20px',
              fontWeight: 600
            }}>
              {!post.user_photo && post.user_name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                {post.user_name}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                {getTimeAgo(post.created_at)}
                {post.category && ` · ${post.category}`}
              </div>
            </div>
          </div>

          {/* Post Content */}
          {post.title && (
            <h1 style={{
              fontSize: '28px',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#9bc4b8'
            }}>
              {post.title}
            </h1>
          )}
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.7,
            marginBottom: '20px',
            whiteSpace: 'pre-wrap'
          }}>
            {post.content}
          </p>

          {/* Like Button */}
          <button
            onClick={handleLike}
            style={{
              padding: '10px 20px',
              background: liked ? '#7fb069' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              color: '#1a1a1a',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ❤️ {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
          </button>
        </div>

        {/* Reply Form */}
        <form onSubmit={handleReply} style={{
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
            Reply
          </h3>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
            minLength={1}
            maxLength={5000}
            rows={4}
            placeholder="Share your thoughts..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              color: '#1a1a1a',
              fontSize: '16px',
              outline: 'none',
              resize: 'vertical',
              marginBottom: '12px'
            }}
          />
          <button
            type="submit"
            disabled={posting || !replyContent.trim()}
            style={{
              padding: '12px 24px',
              background: posting ? 'rgba(127, 176, 105, 0.5)' : '#7fb069',
              border: 'none',
              borderRadius: '3px',
              color: '#1a1a1a',
              fontSize: '14px',
              fontWeight: 600,
              cursor: posting ? 'not-allowed' : 'pointer'
            }}
          >
            {posting ? 'Posting...' : 'Post Reply'}
          </button>
        </form>

        {/* Replies */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
            Replies ({replies.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {replies.map((reply) => (
              <div
                key={reply.id}
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px'
                }}
              >
                {/* Reply Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: reply.user_photo ? `url(${reply.user_photo})` : 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a0a0a',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {!reply.user_photo && reply.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                      {reply.user_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      {getTimeAgo(reply.created_at)}
                    </div>
                  </div>
                </div>

                {/* Reply Content */}
                <p style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {reply.content}
                </p>
              </div>
            ))}
          </div>

          {replies.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              No replies yet. Be the first to reply!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
