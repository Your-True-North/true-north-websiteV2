'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Breadcrumb from '../../components/Breadcrumb'

interface User {
  id: number
  name: string
  email: string
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

export default function ForumPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const handleDelete = async (id, type) => {
    if (!confirm('Delete this ' + type + '? This cannot be undone.')) return
    
    try {
      const res = await fetch('/api/forum/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, userEmail: user?.email })
      })
      
      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete')
      }
    } catch (err) {
      alert('Error deleting')
    }
  }

  const [selectedCategory, setSelectedCategory] = useState('All Posts')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'Introductions'
  })
  const [posting, setPosting] = useState(false)

  const categories = [
    'All Posts',
    'Introductions',
    'Wins & Breakthroughs',
    'Questions & Support',
    'Integration Practices'
  ]

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/login')
      return
    }

    try {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      fetchPosts()
    } catch (err) {
      router.push('/auth/login')
    }
  }, [router])

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [selectedCategory, user])

  const fetchPosts = async () => {
    try {
      const url = selectedCategory === 'All Posts'
        ? '/api/forum/posts'
        : `/api/forum/posts?category=${encodeURIComponent(selectedCategory)}`

      const res = await fetch(url)
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
        router.push(`/forum/${data.post.id}`)
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
      <div style={{
        minHeight: '100vh',
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1a1a1a'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#1a1a1a', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/members"
            style={{
              color: '#e67e22',
              textDecoration: 'none',
              fontSize: '14px',
              marginBottom: '12px',
              display: 'inline-block'
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '12px',
            color: '#1a1a1a'
          }}>
            Community Forum
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666'
          }}>
            Connect, share, and grow together
          </p>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 20px',
                background: selectedCategory === cat ? '#e67e22' : '#f8f8f8',
                border: selectedCategory === cat ? 'none' : '1px solid #e5e5e5',
                borderRadius: '3px',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* New Post Button */}
        <button
          onClick={() => setShowNewPostModal(true)}
          style={{
            width: '100%',
            padding: '16px',
            background: '#f0faf8',
            border: '2px dashed #9bc4b8',
            borderRadius: '3px',
            color: '#e67e22',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          + New Post
        </button>

        {/* Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/forum/${post.id}`}
              style={{
                display: 'block',
                padding: '20px',
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f8f8'
                e.currentTarget.style.borderColor = '#9bc4b8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.borderColor = '#e5e5e5'
              }}
            >
              {/* Post Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: post.user_photo ? `url(${post.user_photo})` : 'linear-gradient(135deg, #e67e22, #e67e22)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0a0a0a',
                  fontSize: '16px',
                  fontWeight: 600
                }}>
                  {!post.user_photo && post.user_name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                    {post.user_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#1a1a1a' }}>
                    {getTimeAgo(post.created_at)}
                    {post.category && ` · ${post.category}`}
                  
                  {user?.email === 'navigate@yourtruenorth.me' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(post.id, 'post')
                      }}
                      style={{
                        marginLeft: 'auto',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '4px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      Delete
                    </button>
                  )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              {post.title && (
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#e67e22'
                }}>
                  {post.title}
                </h3>
              )}
              <p style={{
                fontSize: '14px',
                color: '#333',
                lineHeight: 1.6,
                marginBottom: '12px'
              }}>
                {post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}
              </p>

              {/* Post Stats */}
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#1a1a1a' }}>
                <span>{post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}</span>
                <span>{post.like_count} {post.like_count === 1 ? 'like' : 'likes'}</span>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#1a1a1a'
          }}>
            <p style={{ marginBottom: '20px' }}>No posts yet in this category</p>
            <button
              onClick={() => setShowNewPostModal(true)}
              style={{
                padding: '12px 24px',
                background: '#e67e22',
                border: 'none',
                borderRadius: '3px',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Be the first to post
            </button>
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
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
              background: '#fafafa',
              border: '1px solid #e5e5e5',
              borderRadius: '3px',
              padding: '32px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: '#1a1a1a' }}>
              New Post
            </h2>

            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  {categories.filter(c => c !== 'All Posts').map((cat) => (
                    <option key={cat} value={cat} style={{ background: '#fafafa' }}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="Give your post a title..."
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                  minLength={10}
                  maxLength={10000}
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '16px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  placeholder="What's on your mind? (min 10 characters)"
                />
                <div style={{
                  fontSize: '12px',
                  color: '#1a1a1a',
                  marginTop: '4px'
                }}>
                  {newPost.content.length}/10000 characters
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={posting || newPost.content.length < 10}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: posting ? 'rgba(123, 166, 155, 0.5)' : '#e67e22',
                    border: 'none',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: posting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  style={{
                    padding: '14px 24px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '16px',
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
