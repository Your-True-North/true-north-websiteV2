'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Video {
  id: number
  title: string
  description?: string
  category: string
  duration: number
  createdAt: string
  youtubeUrl: string
  status: string
  comment_count?: string
  reaction_count?: string
}

const categories = [
  'Foundation Work',
  'Breathwork Sessions',
  'Live Teachings',
  'Integration Practices'
]

export default function ManageVideos() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      router.push('/admin/login')
      return
    }

    try {
      const parsed = JSON.parse(adminData)
      if (parsed.role !== 'admin') {
        router.push('/admin/login')
        return
      }
      fetchVideos()
    } catch (err) {
      router.push('/admin/login')
    }
  }, [router])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos')
      const data = await res.json()

      if (res.ok) {
        setVideos(data.videos)
      } else {
        setError(data.error || 'Failed to fetch videos')
      }
      setLoading(false)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load videos')
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/videos?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setVideos(videos.filter(v => v.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete video')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete video')
    }
  }

  const handleUpdate = async (video: Video) => {
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: video.id,
          title: video.title,
          description: video.description,
          youtubeUrl: video.youtubeUrl,
          category: video.category,
          duration: video.duration
        })
      })

      if (res.ok) {
        fetchVideos()
        setEditingVideo(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update video')
      }
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update video')
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        Loading videos...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a' }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Link
            href="/admin/dashboard"
            style={{
              color: '#9bc4b8',
              textDecoration: 'none',
              fontSize: '14px',
              marginBottom: '8px',
              display: 'block'
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a' }}>
            Manage Videos ({videos.length})
          </h1>
        </div>
        <Link
          href="/admin/videos/upload"
          style={{
            padding: '10px 20px',
            background: '#7fb069',
            borderRadius: '3px',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          + Upload New Video
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {error && (
          <div style={{
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '3px',
            color: '#ef4444',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f8f8' }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#999',
                  borderBottom: '1px solid #e5e5e5'
                }}>Title</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#999',
                  borderBottom: '1px solid #e5e5e5'
                }}>Category</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#999',
                  borderBottom: '1px solid #e5e5e5'
                }}>Duration</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#999',
                  borderBottom: '1px solid #e5e5e5'
                }}>Engagement</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#999',
                  borderBottom: '1px solid #e5e5e5'
                }}>Uploaded</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'right',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#999',
                  borderBottom: '1px solid #e5e5e5'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#1a1a1a'
                  }}>{video.title}</td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#333'
                  }}>{video.category}</td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#333'
                  }}>{video.duration ? `${video.duration}m` : '-'}</td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#333'
                  }}>{video.comment_count || 0} / {video.reaction_count || 0}</td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#333'
                  }}>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : '-'}</td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'right'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => window.open(video.youtubeUrl, '_blank')}
                        style={{
                          padding: '6px 12px',
                          background: '#f8f8f8',
                          border: '1px solid #e5e5e5',
                          borderRadius: '3px',
                          color: '#1a1a1a',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditingVideo(video)}
                        style={{
                          padding: '6px 12px',
                          background: '#f0faf8',
                          border: '1px solid #9bc4b8',
                          borderRadius: '3px',
                          color: '#9bc4b8',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video.id, video.title)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '3px',
                          color: '#ef4444',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {videos.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <p style={{ marginBottom: '20px' }}>No videos uploaded yet</p>
            <Link
              href="/admin/videos/upload"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: '#7fb069',
                borderRadius: '3px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Upload Your First Video
            </Link>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingVideo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
                Edit Video
              </h2>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#666' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#666' }}>
                  Description
                </label>
                <textarea
                  value={editingVideo.description || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#666' }}>
                  Category *
                </label>
                <select
                  value={editingVideo.category}
                  onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '14px'
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#666' }}>
                  YouTube URL
                </label>
                <input
                  type="text"
                  value={editingVideo.youtubeUrl || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, youtubeUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#666' }}>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={editingVideo.duration || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, duration: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditingVideo(null)}
                  style={{
                    padding: '12px 24px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    color: '#1a1a1a',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(editingVideo)}
                  style={{
                    padding: '12px 24px',
                    background: '#7fb069',
                    border: 'none',
                    borderRadius: '3px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
