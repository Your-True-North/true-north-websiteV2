'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Video {
  id: number
  title: string
  category: string
  duration: number
  uploaddate: string
  viewcount: number
  featured: boolean
  published: boolean
  youtubeid: string
}

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
        body: JSON.stringify(video)
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
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        Loading videos...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#fff' }}>
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
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#9bc4b8',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>Title</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#9bc4b8',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>Category</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#9bc4b8',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>Duration</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#9bc4b8',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>Views</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#9bc4b8',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>Uploaded</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'right',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#9bc4b8',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#fff'
                  }}>{video.title}</td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>{video.category}</td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>{video.duration ? `${video.duration}m` : '-'}</td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>{video.viewcount || 0}</td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>{new Date(video.uploaddate).toLocaleDateString()}</td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'right'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => window.open(`https://youtube.com/watch?v=${video.youtubeid}`, '_blank')}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '3px',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        View
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
            color: 'rgba(255, 255, 255, 0.5)'
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
    </div>
  )
}
