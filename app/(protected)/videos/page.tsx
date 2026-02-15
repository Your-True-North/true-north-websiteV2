'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import Breadcrumb from '../../components/Breadcrumb'
interface Video {
  id: number
  title: string
  description: string
  youtube_url: string
  category: string
  duration: string
  upload_date: string
  completed: boolean
  last_watched: string | null
  status: 'new' | 'in_progress' | 'completed'
}

interface Categories {
  all: number
  [key: string]: number
}

interface Stats {
  completedVideos: number
  videosWatched: number
  totalWatchTime: number
}

export default function LibraryPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Categories>({ all: 0 })
  const [stats, setStats] = useState<Stats>({ completedVideos: 0, videosWatched: 0, totalWatchTime: 0 })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [continueWatching, setContinueWatching] = useState<Video[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Check auth
    const userData = localStorage.getItem('user')
    if (!userData) {
      window.location.replace('/auth/login')
      return
    }

    fetchVideos()
  }, [selectedCategory, searchQuery, sortBy])

  const fetchVideos = async () => {
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        sort: sortBy
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const res = await fetch(`/api/videos?${params}`)
      const data = await res.json()

      if (res.ok) {
        setVideos(data.videos)
        
        // Fetch continue watching
        fetch('/api/user/stats', {
          headers: { 'x-user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
        })
          .then(r => r.json())
          .then(d => {
            if (d.stats?.continueWatching) {
              setContinueWatching(d.stats.continueWatching)
            }
          })
          .catch(e => console.error('Failed to fetch continue watching:', e))

        setCategories(data.categories)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('[Library] Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#7fb069'
      case 'in_progress':
        return '#9bc4b8'
      default:
        return 'rgba(255, 255, 255, 0.6)'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'New'
    }
  }

  const categoryLabels: { [key: string]: string } = {
    all: 'All Videos',
    'Foundation Work': 'Foundation Work',
    'Breathwork Sessions': 'Breathwork',
    'Live Teachings': 'Live Teachings',
    'Integration Practices': 'Integration'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontWeight: 300 }}>Loading library...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#1a1a1a' }}>
      {/* Animated Background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '-12rem',
          width: isMobile ? '18rem' : '24rem',
          height: isMobile ? '18rem' : '24rem',
          background: 'radial-gradient(circle, rgba(155, 196, 184, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '-12rem',
          width: isMobile ? '18rem' : '24rem',
          height: isMobile ? '18rem' : '24rem',
          background: 'radial-gradient(circle, rgba(127, 176, 105, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }}></div>
      </div>

      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/members" style={{
            fontSize: isMobile ? '1rem' : '1.5rem',
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: '#1a1a1a',
            textDecoration: 'none'
          }}>
            CIRCLE OF RETURN
          </Link>
          <Link href="/members" style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 300,
            border: '1px solid rgba(155, 196, 184, 0.3)',
            borderRadius: '3px',
            color: '#9bc4b8',
            textDecoration: 'none'
          }}>
            Dashboard
          </Link>
        </div>
      </nav>

      <div style={{ position: 'sticky',
        top: 0, zIndex: 10, maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/members"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#9bc4b8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#7fb069'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9bc4b8'}
          >
            ← Back to Dashboard
          </Link>
          
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 300,
              marginBottom: '1.5rem',
              color: '#9bc4b8'
            }}>
              Continue Watching
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {continueWatching.map((video: any) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  style={{
                    position: 'relative',
                    display: 'block',
                    background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.05), rgba(127, 176, 105, 0.05))',
                    border: '1px solid rgba(155, 196, 184, 0.2)',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    textDecoration: 'none',
                    color: '#1a1a1a',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.4)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: 300,
                      marginBottom: '0.5rem'
                    }}>
                      {video.title || 'Video'}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(26, 26, 26, 0.4)'
                    }}>
                      {Math.round(video.percentage)}% complete
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${video.percentage}%`,
                      background: 'linear-gradient(90deg, #9bc4b8, #7fb069)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h1 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 300,
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            My Journey
          </h1>
          <p style={{ color: '#999', fontSize: '1.125rem', fontWeight: 300 }}>
            Your path to transformation
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.1), rgba(127, 176, 105, 0.05))',
            border: '1px solid rgba(155, 196, 184, 0.2)',
            borderRadius: '3px'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 300, color: '#9bc4b8', marginBottom: '0.25rem' }}>
              {stats.completedVideos}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Videos Completed
            </div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(127, 176, 105, 0.1), rgba(155, 196, 184, 0.05))',
            border: '1px solid rgba(127, 176, 105, 0.2)',
            borderRadius: '3px'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 300, color: '#7fb069', marginBottom: '0.25rem' }}>
              {stats.videosWatched}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Videos Watched
            </div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(106, 153, 78, 0.1), rgba(155, 196, 184, 0.05))',
            border: '1px solid rgba(106, 153, 78, 0.2)',
            borderRadius: '3px'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 300, color: '#6a994e', marginBottom: '0.25rem' }}>
              {Math.floor(stats.totalWatchTime / 60)}h
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Hours of Practice
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.875rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              color: '#1a1a1a',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.875rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              color: '#1a1a1a',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              style={{
                padding: '0.75rem 1.5rem',
                background: selectedCategory === key ? 'linear-gradient(135deg, #9bc4b8, #7fb069)' : 'rgba(255, 255, 255, 0.05)',
                border: selectedCategory === key ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: selectedCategory === key ? '#000' : '#1a1a1a',
                fontSize: '0.875rem',
                fontWeight: selectedCategory === key ? 600 : 300,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
              }}
            >
              {label} ({categories[key] || 0})
            </button>
          ))}
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#999'
          }}>
            No videos found{searchQuery ? ' for your search' : ''}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {videos.map(video => (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '100%',
                    paddingTop: '56.25%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg style={{ width: '24px', height: '24px', color: '#000' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      padding: '0.25rem 0.75rem',
                      background: getStatusColor(video.status),
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: video.status === 'new' ? '#000' : '#000'
                    }}>
                      {getStatusLabel(video.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#9bc4b8',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {video.category}
                    </div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 400,
                      marginBottom: '0.5rem',
                      lineHeight: 1.4
                    }}>
                      {video.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#999',
                      lineHeight: 1.6,
                      marginBottom: '1rem',
                      flex: 1
                    }}>
                      {video.description?.substring(0, 100)}{video.description?.length > 100 ? '...' : ''}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: 'rgba(26, 26, 26, 0.4)'
                    }}>
                      <span>{video.duration || 'Video'}</span>
                      <span>{new Date(video.upload_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
