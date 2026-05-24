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
  const [activeSection, setActiveSection] = useState<'teachings' | 'replays'>('teachings')

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

      const userData = localStorage.getItem('user')
      const userId = userData ? JSON.parse(userData).id : null
      const res = await fetch(`/api/videos?${params}`, {
        headers: userId ? { 'x-user-id': userId.toString() } : {}
      })
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

  const getYouTubeId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    return match ? match[1] : null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#7fb069'
      case 'in_progress':
        return '#9bc4b8'
      default:
        return '#2c2c2a'
    }
  }

  const getStatusTextColor = (status: string) => status === 'new' ? '#a0a09c' : '#0f0f0d'

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

  const TOPICS = ['Start Here', 'Spirituality', 'Masculinity', 'The Psyche', 'Somatic Work']

  // Normalise old DB category names to new topic names
  const normaliseCategory = (cat: string): string => {
    const map: { [key: string]: string } = {
      'Foundation Work': 'Spirituality',
      'Live Teachings': 'Masculinity',
      'Integration Practices': 'The Psyche',
      'Breathwork Sessions': 'Somatic Work',
    }
    return map[cat] ?? cat
  }

  const REPLAY_CATEGORY = 'Live Replays'

  const teachingsVideos = videos
    .filter(v => v.category !== REPLAY_CATEGORY)
    .map(v => ({ ...v, category: normaliseCategory(v.category) }))

  const replayVideos = videos.filter(v => v.category === REPLAY_CATEGORY)

  const displayVideos = activeSection === 'teachings'
    ? teachingsVideos.filter(v => selectedCategory === 'all' || v.category === selectedCategory)
    : replayVideos

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666', fontWeight: 300 }}>Loading library...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0d', color: '#f0ede8' }}>
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
                    color: '#f0ede8',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.5)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#f0ede8'
                    }}>
                      {video.title || 'Video'}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#666'
                    }}>
                      {Math.round(video.percentage)}% complete
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: '#2c2c2a',
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
            letterSpacing: '-0.02em',
            color: '#f0ede8'
          }}>
            {activeSection === 'teachings' ? 'Teachings' : 'Live Call Replays'}
          </h1>
          <p style={{ color: '#a0a09c', fontSize: '1rem', fontWeight: 300, marginBottom: '1.5rem' }}>
            {activeSection === 'teachings'
              ? 'The sessions, practices, and foundation work. Work through these at your own pace between live calls.'
              : 'Every live call is recorded and uploaded here. If you missed one, catch up before the next session.'
            }
          </p>

          {/* Section toggle */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '0.5rem', border: '1px solid #2c2c2a', borderRadius: '6px', overflow: 'hidden', width: 'fit-content' }}>
            {(['teachings', 'replays'] as const).map(section => (
              <button
                key={section}
                onClick={() => { setActiveSection(section); setSelectedCategory('all') }}
                style={{
                  padding: '0.75rem 1.75rem',
                  background: activeSection === section
                    ? section === 'replays' ? 'linear-gradient(135deg, #9bc4b8, #7fb069)' : '#f0ede8'
                    : '#1a1a18',
                  border: 'none',
                  borderRight: section === 'teachings' ? '1px solid #2c2c2a' : 'none',
                  color: activeSection === section ? (section === 'replays' ? '#fff' : '#0f0f0d') : '#666',
                  fontSize: '0.9rem',
                  fontWeight: activeSection === section ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.01em'
                }}
              >
                {section === 'teachings' ? 'Teachings' : 'Live Replays'}
                {section === 'replays' && replayVideos.length > 0 && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: activeSection === 'replays' ? 'rgba(255,255,255,0.3)' : '#9bc4b8',
                    color: '#fff',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>{replayVideos.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats — compact strip */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '2rem',
          padding: '0.75rem 1rem',
          background: '#1a1a18',
          borderRadius: '6px',
          flexWrap: 'wrap'
        }}>
          {[
            { value: stats.completedVideos, label: 'Completed', color: '#9bc4b8' },
            { value: stats.videosWatched, label: 'Watched', color: '#7fb069' },
            { value: `${Math.floor(stats.totalWatchTime / 60)}h`, label: 'Practice', color: '#6a994e' },
          ].map(({ value, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color }}>{value}</span>
              <span style={{ fontSize: '0.8rem', color: '#999' }}>{label}</span>
            </div>
          ))}
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
              background: '#1a1a18',
              border: '1px solid #2c2c2a',
              borderRadius: '3px',
              color: '#f0ede8',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.875rem 1rem',
              background: '#1a1a18',
              border: '1px solid #2c2c2a',
              borderRadius: '3px',
              color: '#f0ede8',
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

        {/* Category Tabs — teachings only */}
        {activeSection === 'teachings' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : `repeat(${TOPICS.length + 1}, 1fr)`,
            gap: '0.75rem',
            marginBottom: '2.5rem',
          }}>
            {(['all', ...TOPICS] as const).map((key) => {
              const isActive = selectedCategory === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{
                    padding: '1rem 0.5rem',
                    background: isActive ? '#f0ede8' : '#1a1a18',
                    border: isActive ? '2px solid #f0ede8' : '2px solid #2c2c2a',
                    borderRadius: '8px',
                    color: isActive ? '#0f0f0d' : '#666',
                    fontSize: isMobile ? '0.8rem' : '0.95rem',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#9bc4b8'
                      e.currentTarget.style.color = '#f0ede8'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#2c2c2a'
                      e.currentTarget.style.color = '#666'
                    }
                  }}
                >
                  {key === 'all' ? 'All Topics' : key}
                </button>
              )
            })}
          </div>
        )}

        {/* Replays catch-up notice */}
        {activeSection === 'replays' && replayVideos.length > 0 && (
          <div style={{
            padding: '1rem 1.25rem',
            background: 'rgba(155,196,184,0.08)',
            border: '1px solid rgba(155,196,184,0.25)',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#a0a09c',
            lineHeight: 1.6
          }}>
            Missed a call? Every session is recorded and posted here, usually within 48 hours. Watch it before the next live call so you stay with the group and do not fall behind on the work.
          </div>
        )}

        {/* Video Grid */}
        {displayVideos.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#999',
            fontSize: '0.95rem'
          }}>
            {activeSection === 'replays'
              ? 'No replays posted yet. Check back after the next live call.'
              : `No videos found${searchQuery ? ' for your search' : ''}`}
          </div>
        ) : activeSection === 'teachings' && selectedCategory === 'all' ? (
          // Grouped by topic
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {TOPICS.map(topic => {
              const topicVideos = displayVideos.filter(v => v.category === topic)
              if (topicVideos.length === 0) return null
              return (
                <div key={topic}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f0ede8', margin: 0 }}>{topic}</h2>
                    <div style={{ flex: 1, height: '1px', background: '#2c2c2a' }} />
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>{topicVideos.length} video{topicVideos.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {topicVideos.map(video => {
                      const youtubeId = getYouTubeId(video.youtube_url)
                      const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null
                      return (
                        <Link key={video.id} href={`/videos/${video.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ background: '#1a1a18', border: '1px solid #2c2c2a', borderRadius: '6px', overflow: 'hidden', transition: 'all 0.2s ease', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9bc4b8'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2c2c2a'; e.currentTarget.style.transform = 'translateY(0)' }}
                          >
                            <div style={{ width: '100%', paddingTop: '56.25%', background: thumbnailUrl ? `url(${thumbnailUrl}) center/cover` : 'rgba(0,0,0,0.5)', position: 'relative' }}>
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(155, 196, 184, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg style={{ width: '24px', height: '24px', color: '#9bc4b8' }} fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                              </div>
                              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.25rem 0.75rem', background: getStatusColor(video.status), borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: getStatusTextColor(video.status) }}>{getStatusLabel(video.status)}</div>
                            </div>
                            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.4, color: '#f0ede8' }}>{video.title}</h3>
                              <p style={{ fontSize: '0.875rem', color: '#a0a09c', lineHeight: 1.6, marginBottom: '1rem', flex: 1 }}>{video.description?.substring(0, 100)}{video.description?.length > 100 ? '...' : ''}</p>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', color: '#999' }}>
                                <span>{video.duration || 'Video'}</span>
                                <span>{new Date(video.upload_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {displayVideos.map(video => {
              const youtubeId = getYouTubeId(video.youtube_url)
              const thumbnailUrl = youtubeId
                ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                : null
              return (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: '#1a1a18',
                  border: '1px solid #2c2c2a',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9bc4b8'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2c2c2a'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '100%',
                    paddingTop: '56.25%',
                    background: thumbnailUrl
                      ? `url(${thumbnailUrl}) center/cover`
                      : 'rgba(0, 0, 0, 0.5)',
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
                      background: 'rgba(155, 196, 184, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg style={{ width: '24px', height: '24px', color: '#9bc4b8' }} fill="currentColor" viewBox="0 0 20 20">
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
                      color: '#0f0f0d'
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
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      lineHeight: 1.4,
                      color: '#f0ede8'
                    }}>
                      {video.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#a0a09c',
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
                      color: '#999'
                    }}>
                      <span>{video.duration || 'Video'}</span>
                      <span>{new Date(video.upload_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}
