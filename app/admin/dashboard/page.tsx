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

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

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
      } else {
        console.error('Failed to fetch stats:', data.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin/login')
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

  if (!admin) return null

  const menuItems = [
    { title: 'Upload Videos', href: '/admin/videos/upload', icon: '📹', desc: 'Add new video content' },
    { title: 'Manage Videos', href: '/admin/videos/manage', icon: '🎬', desc: 'Edit and delete videos' },
    { title: 'Forum Starters', href: '/admin/forum/starters', icon: '💬', desc: 'Manage conversation starters' },
    { title: 'Founding Members', href: '/admin/founding', icon: '👥', desc: 'View founding member list' }
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
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#9bc4b8', marginBottom: '4px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>
            Welcome back, {admin.name}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              style={{
                display: 'block',
                padding: '32px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(127, 176, 105, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(127, 176, 105, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                {item.icon}
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#9bc4b8'
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: 1.6
              }}>
                {item.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Platform Stats */}
        <div style={{
          marginTop: '60px',
          padding: '32px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '3px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '24px',
            color: '#9bc4b8'
          }}>
            Platform Statistics
          </h2>

          {statsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
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
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
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
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Total Members
                </div>
              </div>

              <div style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                  {stats.totalComments}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Total Comments
                </div>
              </div>

              <div style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                  {stats.totalReactions}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
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
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Videos This Month
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
              Failed to load stats
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: '40px',
          padding: '32px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '3px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '20px',
            color: '#9bc4b8'
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: '#fff',
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
