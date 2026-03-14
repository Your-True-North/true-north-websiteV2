'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

interface DashboardData {
  stats: {
    totalVideos: number
    totalMembers: number
    totalComments: number
    totalReactions: number
    videosThisMonth: number
  }
  topMembers: Array<{
    id: string
    name: string
    email: string
    level: string
    comment_count: string
    reaction_count: string
    total_engagement: string
  }>
  recentActivity: Array<{
    type: string
    title: string
    description: string | null
    createdat: string
    user_name: string | null
    user_email: string | null
    video_title: string | null
  }>
  topVideos: Array<{
    id: string
    title: string
    category: string
    comment_count: string
    reaction_count: string
    total_engagement: string
  }>
}

interface Video {
  id: string
  title: string
  description: string
  youtubeurl: string
  youtubeid: string
  category: string
  duration: number | null
  status: string
  uploaddate: string
  comment_count: string
  reaction_count: string
}

const categories = ["Foundation Work", "Breathwork Sessions", "Live Teachings", "Integration Practices"]

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [newVideo, setNewVideo] = useState({
    title: '',
    duration: '',
    category: 'Foundation Work',
    youtubeUrl: '',
    description: '',
    status: 'published'
  })

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      if (res.ok) {
        setDashboardData(data)
      }
    } catch (err) {
      console.error('[Admin] Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos')
      const data = await res.json()
      if (res.ok && data.videos) {
        setVideos(data.videos)
      }
    } catch (err) {
      console.error('[Admin] Failed to fetch videos:', err)
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      logger.debug('Admin', 'No user found, redirecting to login')
      setLoading(false) // Set loading false before redirect
      window.location.replace('/auth/login')
      return
    }

    try {
      const userData = JSON.parse(savedUser)

      // Verify user data exists
      if (!userData.email || !userData.id) {
        logger.debug('Admin', 'Invalid user data, redirecting to login')
        localStorage.removeItem('user')
        setLoading(false) // Set loading false before redirect
        window.location.replace('/auth/login')
        return
      }

      // Check admin role
      if (userData.role !== 'admin') {
        logger.debug('Admin', 'Non-admin user, redirecting to journey')
        setLoading(false) // Set loading false before redirect
        window.location.replace('/journey')
        return
      }

      logger.debug('Admin', 'Admin user authenticated', userData.email)
      setUser(userData)
      // Fetch real data from API
      fetchDashboardData()
      fetchVideos()
    } catch (err) {
      console.error('[Admin] Failed to parse user data:', err)
      localStorage.removeItem('user')
      setLoading(false) // Set loading false before redirect
      window.location.replace('/auth/login')
    }
  }, [])

  const handleSaveVideo = () => {
    const videoData = editingVideo || newVideo

    if (editingVideo) {
      // Update existing video
      setVideos(videos.map(v => v.id === editingVideo.id ? {
        ...editingVideo,
        title: editingVideo.title,
        description: editingVideo.description,
        youtubeurl: editingVideo.youtubeurl,
        category: editingVideo.category,
        duration: editingVideo.duration,
        status: editingVideo.status
      } : v))
    } else {
      // Add new video
      const newId = String(videos.length + 1)
      const newVideoData: Video = {
        id: newId,
        title: newVideo.title,
        description: newVideo.description,
        youtubeurl: newVideo.youtubeUrl,
        youtubeid: newVideo.youtubeUrl.split('v=')[1]?.split('&')[0] || '',
        category: newVideo.category,
        duration: parseInt(newVideo.duration) || null,
        status: newVideo.status,
        uploaddate: new Date().toISOString(),
        comment_count: '0',
        reaction_count: '0'
      }
      setVideos([...videos, newVideoData])

      // Update dashboard stats
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          stats: {
            ...dashboardData.stats,
            totalVideos: dashboardData.stats.totalVideos + 1,
            videosThisMonth: dashboardData.stats.videosThisMonth + 1
          }
        })
      }
    }

    setEditingVideo(null)
    setShowAddVideo(false)
    setNewVideo({
      title: '',
      duration: '',
      category: 'Foundation Work',
      youtubeUrl: '',
      description: '',
      status: 'published'
    })
  }

  const handleDeleteVideo = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return

    setVideos(videos.filter(v => v.id !== id))

    // Update dashboard stats
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        stats: {
          ...dashboardData.stats,
          totalVideos: dashboardData.stats.totalVideos - 1
        }
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999' }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', paddingTop: '6rem' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: '1px solid #e5e5e5',
        backdropFilter: 'blur(20px)',
        background: '#ffffff'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/" style={{
            fontSize: '1.5rem',
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: '#1a1a1a',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            CIRCLE OF RETURN
          </Link>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/members" style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 300,
              border: '1px solid #9bc4b8',
              borderRadius: '8px',
              color: '#9bc4b8',
              textDecoration: 'none'
            }}>
              Members Dashboard
            </Link>
            <Link href="/journey" style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 300,
              border: '1px solid #9bc4b8',
              borderRadius: '8px',
              color: '#9bc4b8',
              textDecoration: 'none'
            }}>
              Journey
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1a1a1a' }}>Admin Dashboard</h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            Manage your community, videos, and track engagement
          </p>
        </div>

        {/* Stats Grid */}
        {dashboardData?.stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(155, 196, 184, 0.1)',
              border: '1px solid rgba(155, 196, 184, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Total Videos
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: '#9bc4b8' }}>
                {dashboardData.stats.totalVideos}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
                {dashboardData.stats.videosThisMonth} this month
              </div>
            </div>

            <div style={{
              background: 'rgba(127, 176, 105, 0.1)',
              border: '1px solid rgba(127, 176, 105, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Members
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: '#7fb069' }}>
                {dashboardData.stats.totalMembers}
              </div>
            </div>

            <div style={{
              background: 'rgba(106, 153, 78, 0.1)',
              border: '1px solid rgba(106, 153, 78, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Comments
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: '#6a994e' }}>
                {dashboardData.stats.totalComments}
              </div>
            </div>

            <div style={{
              background: 'rgba(141, 180, 168, 0.1)',
              border: '1px solid rgba(141, 180, 168, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Reactions
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: '#8db4a8' }}>
                {dashboardData.stats.totalReactions}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

          {/* Top Engaged Members */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e5e5',
              background: '#f0faf8'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1a1a' }}>🌟 Top Engaged Members</h2>
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                Members to personally reach out to
              </p>
            </div>
            <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              {dashboardData?.topMembers?.length > 0 ? dashboardData.topMembers.map((member, index) => (
                <div key={member.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: '#f8f8f8',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      background: index < 3 ? 'linear-gradient(135deg, #9bc4b8, #7fb069)' : '#e8e8e8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9bc4b8' }}>
                      {member.total_engagement} actions
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                      {member.comment_count} comments · {member.reaction_count} likes
                    </div>
                  </div>
                </div>
              )) : <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No member data yet</div>}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e5e5',
              background: '#f5faf3'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1a1a' }}>📊 Recent Activity</h2>
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                Live community engagement feed
              </p>
            </div>
            <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              {dashboardData?.recentActivity?.length > 0 ? dashboardData.recentActivity.map((activity, index) => (
                <div key={index} style={{
                  padding: '0.75rem',
                  borderLeft: '2px solid #9bc4b8',
                  marginBottom: '0.75rem',
                  paddingLeft: '1rem'
                }}>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#9bc4b8' }}>
                      {activity.user_name || 'Unknown'}
                    </span>
                    {' '}
                    <span style={{ color: '#333' }}>
                      {activity.title}
                    </span>
                  </div>
                  {activity.video_title && (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                      on "{activity.video_title}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: '#999' }}>
                    {formatTime(activity.createdat)}
                  </div>
                </div>
              )) : <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No activity yet</div>}
            </div>
          </div>
        </div>

        {/* Video Management */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1a1a' }}>🎥 Video Management</h2>
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                Upload and manage community videos
              </p>
            </div>
            <button
              onClick={() => setShowAddVideo(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                color: '#000',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              + Add Video
            </button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {videos.length > 0 ? videos.map((video) => (
              <div key={video.id} style={{
                background: '#f8f8f8',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1a1a1a' }}>
                      {video.title}
                    </h3>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.75rem',
                      color: '#666',
                      marginBottom: '0.5rem'
                    }}>
                      <span>{video.category}</span>
                      <span>•</span>
                      <span>{formatDate(video.uploaddate)}</span>
                      <span>•</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: video.status === 'published' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                        color: video.status === 'published' ? '#4ade80' : '#fbbf24'
                      }}>
                        {video.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                      💬 {video.comment_count} comments · ❤️ {video.reaction_count} reactions
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setEditingVideo(video)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#f0faf8',
                        color: '#9bc4b8',
                        border: '1px solid #9bc4b8',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )) : <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No videos yet. Click "+ Add Video" to upload.</div>}
          </div>
        </div>
      </div>

      {/* Add/Edit Video Modal */}
      {(showAddVideo || editingVideo) && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e5e5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1a1a' }}>
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h2>
              <button
                onClick={() => {
                  setEditingVideo(null)
                  setShowAddVideo(false)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#333' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={editingVideo ? editingVideo.title : newVideo.title}
                  onChange={(e) => editingVideo
                    ? setEditingVideo({ ...editingVideo, title: e.target.value })
                    : setNewVideo({ ...newVideo, title: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    color: '#1a1a1a',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter video title"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#333' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={editingVideo ? editingVideo.duration || '' : newVideo.duration}
                    onChange={(e) => editingVideo
                      ? setEditingVideo({ ...editingVideo, duration: parseInt(e.target.value) || null })
                      : setNewVideo({ ...newVideo, duration: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#1a1a1a',
                      fontSize: '0.875rem'
                    }}
                    placeholder="25"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#333' }}>
                    Category *
                  </label>
                  <select
                    value={editingVideo ? editingVideo.category : newVideo.category}
                    onChange={(e) => editingVideo
                      ? setEditingVideo({ ...editingVideo, category: e.target.value })
                      : setNewVideo({ ...newVideo, category: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#1a1a1a',
                      fontSize: '0.875rem'
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#333' }}>
                  YouTube URL *
                </label>
                <input
                  type="url"
                  value={editingVideo ? editingVideo.youtubeurl : newVideo.youtubeUrl}
                  onChange={(e) => editingVideo
                    ? setEditingVideo({ ...editingVideo, youtubeurl: e.target.value })
                    : setNewVideo({ ...newVideo, youtubeUrl: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    color: '#1a1a1a',
                    fontSize: '0.875rem'
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#333' }}>
                  Description
                </label>
                <textarea
                  value={editingVideo ? editingVideo.description : newVideo.description}
                  onChange={(e) => editingVideo
                    ? setEditingVideo({ ...editingVideo, description: e.target.value })
                    : setNewVideo({ ...newVideo, description: e.target.value })
                  }
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    color: '#1a1a1a',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                  placeholder="Enter video description"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#333' }}>
                  Status
                </label>
                <select
                  value={editingVideo ? editingVideo.status : newVideo.status}
                  onChange={(e) => editingVideo
                    ? setEditingVideo({ ...editingVideo, status: e.target.value })
                    : setNewVideo({ ...newVideo, status: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    color: '#1a1a1a',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleSaveVideo}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
                <button
                  onClick={() => {
                    setEditingVideo(null)
                    setShowAddVideo(false)
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f8f8f8',
                    color: '#1a1a1a',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
