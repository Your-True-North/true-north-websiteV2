'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Admin {
  id: number
  email: string
  name: string
  role: string
}

interface DashboardStats {
  totalVideos: number
  totalMembers: number
  totalComments: number
  totalReactions: number
  videosThisMonth: number
}

interface Member {
  id: number
  name: string
  email: string
  level: string
  joindate: string
  comment_count: string
  reaction_count: string
  total_engagement: string
}

interface Activity {
  type: string
  title: string
  description: string
  createdAt: string
  user_name: string
  user_email: string
  video_title: string
}

interface TopVideo {
  id: number
  title: string
  category: string
  createdAt: string
  comment_count: string
  reaction_count: string
  total_engagement: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topMembers, setTopMembers] = useState<Member[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [topVideos, setTopVideos] = useState<TopVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'videos' | 'activity'>('overview')

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      router.push('/admin/login')
      return
    }

    try {
      const parsedAdmin = JSON.parse(adminData)
      if (parsedAdmin.role !== 'admin') {
        router.push('/admin/login')
        return
      }
      setAdmin(parsedAdmin)
      setLoading(false)
    } catch (err) {
      console.error('Failed to parse admin data:', err)
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
    if (admin) {
      fetchStats()
    }
  }, [admin])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()

      if (res.ok && data.stats) {
        setStats(data.stats)
        setTopMembers(data.topMembers || [])
        setRecentActivity(data.recentActivity || [])
        setTopVideos(data.topVideos || [])
      } else {
        console.error('Failed to fetch stats:', data.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999'
      }}>
        Loading...
      </div>
    )
  }

  if (!admin) return null

  const menuItems = [
    { title: 'Upload Videos', href: '/admin/videos/upload', icon: '📹', desc: 'Add new video content' },
    { title: 'Manage Videos', href: '/admin/videos/manage', icon: '🎬', desc: 'Edit and delete videos' },
    { title: 'Founding Members', href: '/admin/founding', icon: '👥', desc: 'View founding member list' }
  ]

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
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Welcome back, {admin.name}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#f8f8f8',
            border: '1px solid #e5e5e5',
            borderRadius: '3px',
            color: '#1a1a1a',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          borderBottom: '1px solid #e5e5e5',
          paddingBottom: '16px'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'members', label: 'Members', icon: '👥' },
            { id: 'videos', label: 'Videos', icon: '🎬' },
            { id: 'activity', label: 'Activity', icon: '📋' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab.id ? 'rgba(127, 176, 105, 0.15)' : 'transparent',
                border: activeTab === tab.id ? '1px solid #7fb069' : '1px solid transparent',
                borderRadius: '3px',
                color: activeTab === tab.id ? '#7fb069' : '#666',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Quick Menu */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {menuItems.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '24px',
                    background: '#ffffff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '3px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f5faf3'
                    e.currentTarget.style.borderColor = '#7fb069'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.borderColor = '#e5e5e5'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: '#9bc4b8' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#666' }}>{item.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>
                Top Engaged Members ({topMembers.length})
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f8f8' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Member</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Level</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Joined</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Comments</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Reactions</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {topMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        No members found
                      </td>
                    </tr>
                  ) : (
                    topMembers.map((member, i) => (
                      <tr key={member.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 500 }}>{member.name || 'Unknown'}</div>
                          <div style={{ fontSize: '13px', color: '#999' }}>{member.email}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '4px 12px',
                            background: 'rgba(155, 196, 184, 0.15)',
                            borderRadius: '12px',
                            fontSize: '13px',
                            color: '#9bc4b8'
                          }}>
                            {member.level || 'Seeker'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#333', fontSize: '14px' }}>
                          {formatDate(member.joindate)}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: '#333' }}>
                          {member.comment_count}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: '#333' }}>
                          {member.reaction_count}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px',
                            background: parseInt(member.total_engagement) > 5 ? 'rgba(127, 176, 105, 0.15)' : '#e8e8e8',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: parseInt(member.total_engagement) > 5 ? '#7fb069' : '#666'
                          }}>
                            {member.total_engagement}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>
                Top Engaged Videos
              </h2>
              <Link href="/admin/videos/manage" style={{
                padding: '8px 16px',
                background: '#7fb069',
                borderRadius: '3px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600
              }}>
                Manage All Videos
              </Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f8f8' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Video</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Uploaded</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Comments</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Reactions</th>
                  </tr>
                </thead>
                <tbody>
                  {topVideos.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        No videos found
                      </td>
                    </tr>
                  ) : (
                    topVideos.map((video) => (
                      <tr key={video.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 500 }}>{video.title}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '4px 12px',
                            background: 'rgba(127, 176, 105, 0.15)',
                            borderRadius: '12px',
                            fontSize: '13px',
                            color: '#7fb069'
                          }}>
                            {video.category}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#333', fontSize: '14px' }}>
                          {formatDate(video.createdAt)}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: '#333' }}>
                          {video.comment_count}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: '#333' }}>
                          {video.reaction_count}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>
                Recent Activity
              </h2>
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {recentActivity.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  No recent activity
                </div>
              ) : (
                recentActivity.map((activity, i) => (
                  <div key={i} style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #e5e5e5',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(155, 196, 184, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '14px'
                    }}>
                      {activity.type === 'comment' ? '💬' : activity.type === 'signup' ? '👤' : activity.type === 'video_watched' ? '▶️' : '📌'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                        {activity.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                        {activity.description}
                        {activity.user_name && <span> by <strong style={{ color: '#9bc4b8' }}>{activity.user_name}</strong></span>}
                        {activity.video_title && <span> on "{activity.video_title}"</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {formatDateTime(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Platform Stats (shown on all tabs) */}
        <div style={{
          marginTop: '60px',
          padding: '32px',
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '3px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '24px',
            color: '#1a1a1a'
          }}>
            Platform Statistics
          </h2>

          {statsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Loading stats...
            </div>
          ) : stats ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                padding: '24px',
                background: 'rgba(127, 176, 105, 0.1)',
                border: '1px solid rgba(127, 176, 105, 0.2)',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#7fb069', marginBottom: '8px' }}>
                  {stats.totalVideos}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Total Videos
                </div>
              </div>

              <div style={{
                padding: '24px',
                background: 'rgba(155, 196, 184, 0.1)',
                border: '1px solid rgba(155, 196, 184, 0.2)',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#9bc4b8', marginBottom: '8px' }}>
                  {stats.totalMembers}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Total Members
                </div>
              </div>

              <div style={{
                padding: '24px',
                background: '#f8f8f8',
                border: '1px solid #e5e5e5',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
                  {stats.totalComments}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Total Comments
                </div>
              </div>

              <div style={{
                padding: '24px',
                background: '#f8f8f8',
                border: '1px solid #e5e5e5',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
                  {stats.totalReactions}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Total Reactions
                </div>
              </div>

              <div style={{
                padding: '24px',
                background: 'rgba(127, 176, 105, 0.05)',
                border: '1px solid rgba(127, 176, 105, 0.15)',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#7fb069', marginBottom: '8px' }}>
                  {stats.videosThisMonth}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Videos This Month
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Failed to load stats
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: '40px',
          padding: '32px',
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '3px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '20px',
            color: '#1a1a1a'
          }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/members"
              style={{
                padding: '12px 24px',
                background: '#7fb069',
                borderRadius: '3px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              View Members Portal
            </Link>
            <Link
              href="/admin/founding"
              style={{
                padding: '12px 24px',
                background: '#f8f8f8',
                border: '1px solid #e5e5e5',
                borderRadius: '3px',
                color: '#1a1a1a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Founding Members
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
