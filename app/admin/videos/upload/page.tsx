'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadVideo() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeId: '',
    category: 'Foundation Work',
    duration: '',
    thumbnailUrl: ''
  })

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
      }
    } catch (err) {
      router.push('/admin/login')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to upload video')
        setLoading(false)
        return
      }

      setSuccess('Video uploaded successfully!')
      setFormData({
        title: '',
        description: '',
        youtubeId: '',
        category: 'Foundation Work',
        duration: '',
        thumbnailUrl: ''
      })
      setLoading(false)

      setTimeout(() => {
        router.push('/admin/videos/manage')
      }, 2000)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const categories = [
    'Foundation Work',
    'Breathwork Sessions',
    'Energy Healing',
    'Integration Practices'
  ]

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
            Upload Video
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Video Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="e.g., Introduction to Breathwork"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder="Describe the video content..."
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              YouTube Video ID *
            </label>
            <input
              type="text"
              value={formData.youtubeId}
              onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="dQw4w9WgXcQ (just the ID, not full URL)"
            />
            <p style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '4px'
            }}>
              From URL: https://youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} style={{ background: '#0a0a0a' }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              min="1"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="e.g., 15"
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Thumbnail URL (optional)
            </label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="YouTube auto-generates if left empty"
            />
          </div>

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

          {success && (
            <div style={{
              padding: '12px',
              background: 'rgba(127, 176, 105, 0.1)',
              border: '1px solid rgba(127, 176, 105, 0.3)',
              borderRadius: '3px',
              color: '#7fb069',
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? 'rgba(127, 176, 105, 0.5)' : '#7fb069',
                border: 'none',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
            <Link
              href="/admin/videos/manage"
              style={{
                padding: '14px 32px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
