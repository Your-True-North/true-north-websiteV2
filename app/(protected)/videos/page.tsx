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
      case 'completed': return 'var(--kyn-green-bg)'
      case 'in_progress': return 'var(--kyn-blue-bg)'
      default: return 'var(--kyn-surface-raised)'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--kyn-green)'
      case 'in_progress': return 'var(--kyn-blue)'
      default: return 'var(--kyn-ink3)'
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
      <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--kyn-ink3)', fontFamily: 'var(--kyn-font-sans)', fontWeight: 300 }}>Loading library...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-sans)' }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px 14px 72px' : '28px 32px 52px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/members"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--kyn-green)',
              textDecoration: 'none',
              fontSize: '13px',
              marginBottom: '16px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--kyn-green)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--kyn-green)'}
          >
            ← Back to Dashboard
          </Link>

          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 400,
                marginBottom: '14px',
                color: 'var(--kyn-ink)',
                fontFamily: 'var(--kyn-font-serif)'
              }}>
                Continue Watching
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '11px'
              }}>
                {continueWatching.map((video: any) => (
                  <Link
                    key={video.id}
                    href={`/videos/${video.id}`}
                    style={{
                      position: 'relative',
                      display: 'block',
                      background: 'var(--kyn-surface)',
                      border: '1px solid var(--kyn-border)',
                      borderRadius: 'var(--kyn-r-lg)',
                      padding: '14px 16px',
                      textDecoration: 'none',
                      color: 'var(--kyn-ink)',
                      transition: 'box-shadow 0.15s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        marginBottom: '4px',
                        color: 'var(--kyn-ink)'
                      }}>
                        {video.title || 'Video'}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--kyn-ink3)'
                      }}>
                        {Math.round(video.percentage)}% complete
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      width: '100%',
                      height: '3px',
                      background: 'var(--kyn-border)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${video.percentage}%`,
                        background: 'var(--kyn-green)',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <h1 style={{
            fontSize: isMobile ? '20px' : '22px',
            fontWeight: 400,
            marginBottom: '6px',
            fontFamily: 'var(--kyn-font-serif)',
            color: 'var(--kyn-ink)'
          }}>
            {activeSection === 'teachings' ? 'Teachings' : 'Live Call Replays'}
          </h1>
          <p style={{ color: 'var(--kyn-ink2)', fontSize: '13.5px', fontWeight: 300, marginBottom: '18px', lineHeight: 1.6 }}>
            {activeSection === 'teachings'
              ? 'The sessions, practices, and foundation work. Work through these at your own pace between live calls.'
              : 'Every live call is recorded and uploaded here. If you missed one, catch up before the next session.'
            }
          </p>

          {/* Section toggle */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '6px', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', overflow: 'hidden', width: 'fit-content' }}>
            {(['teachings', 'replays'] as const).map(section => (
              <button
                key={section}
                onClick={() => { setActiveSection(section); setSelectedCategory('all') }}
                style={{
                  padding: '8px 18px',
                  background: activeSection === section ? 'var(--kyn-green-bg)' : 'var(--kyn-surface)',
                  border: 'none',
                  borderRight: section === 'teachings' ? '1px solid var(--kyn-border)' : 'none',
                  color: activeSection === section ? 'var(--kyn-green)' : 'var(--kyn-ink3)',
                  fontSize: '13px',
                  fontWeight: activeSection === section ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.01em'
                }}
              >
                {section === 'teachings' ? 'Teachings' : 'Live Replays'}
                {section === 'replays' && replayVideos.length > 0 && (
                  <span style={{
                    marginLeft: '7px',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    background: activeSection === 'replays' ? 'var(--kyn-green)' : 'var(--kyn-green-bg)',
                    color: activeSection === 'replays' ? '#fff' : 'var(--kyn-green)',
                    padding: '1px 6px',
                    borderRadius: '8px'
                  }}>{replayVideos.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats — compact strip */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          padding: '12px 16px',
          background: 'var(--kyn-surface)',
          borderRadius: 'var(--kyn-r-lg)',
          border: '1px solid var(--kyn-border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          flexWrap: 'wrap'
        }}>
          {[
            { value: stats.completedVideos, label: 'Completed', color: 'var(--kyn-green)' },
            { value: stats.videosWatched, label: 'Watched', color: 'var(--kyn-green-hi)' },
            { value: `${Math.floor(stats.totalWatchTime / 60)}h`, label: 'Practice', color: 'var(--kyn-ink2)' },
          ].map(({ value, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color }}>{value}</span>
              <span style={{ fontSize: '12px', color: 'var(--kyn-ink3)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Search and Sort */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '10px',
          marginBottom: '18px'
        }}>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '9px 12px',
              background: 'var(--kyn-surface)',
              border: '1px solid var(--kyn-border)',
              borderRadius: 'var(--kyn-r)',
              color: 'var(--kyn-ink)',
              fontSize: '13.5px',
              outline: 'none',
              fontFamily: 'var(--kyn-font-sans)'
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '9px 12px',
              background: 'var(--kyn-surface)',
              border: '1px solid var(--kyn-border)',
              borderRadius: 'var(--kyn-r)',
              color: 'var(--kyn-ink2)',
              fontSize: '13.5px',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--kyn-font-sans)'
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
            gap: '8px',
            marginBottom: '24px',
          }}>
            {(['all', ...TOPICS] as const).map((key) => {
              const isActive = selectedCategory === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{
                    padding: '8px 6px',
                    background: isActive ? 'var(--kyn-green-bg)' : 'var(--kyn-surface)',
                    border: `1px solid ${isActive ? 'var(--kyn-border-green)' : 'var(--kyn-border)'}`,
                    borderRadius: 'var(--kyn-r-lg)',
                    color: isActive ? 'var(--kyn-green)' : 'var(--kyn-ink3)',
                    fontSize: isMobile ? '11.5px' : '12.5px',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--kyn-border-green)'
                      e.currentTarget.style.color = 'var(--kyn-green)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--kyn-border)'
                      e.currentTarget.style.color = 'var(--kyn-ink3)'
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
            padding: '12px 14px',
            background: 'var(--kyn-green-bg)',
            border: '1px solid var(--kyn-border-green)',
            borderRadius: 'var(--kyn-r)',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--kyn-ink2)',
            lineHeight: 1.6
          }}>
            Missed a call? Every session is recorded and posted here, usually within 48 hours. Watch it before the next live call so you stay with the group and do not fall behind on the work.
          </div>
        )}

        {/* Video Grid */}
        {displayVideos.length === 0 ? (
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'var(--kyn-ink3)',
            fontSize: '13.5px'
          }}>
            {activeSection === 'replays'
              ? 'No replays posted yet. Check back after the next live call.'
              : `No videos found${searchQuery ? ' for your search' : ''}`}
          </div>
        ) : activeSection === 'teachings' && selectedCategory === 'all' ? (
          // Grouped by topic
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {TOPICS.map(topic => {
              const topicVideos = displayVideos.filter(v => v.category === topic)
              if (topicVideos.length === 0) return null
              return (
                <div key={topic}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--kyn-ink)', margin: 0, fontFamily: 'var(--kyn-font-serif)' }}>{topic}</h2>
                    <div style={{ flex: 1, height: '1px', background: 'var(--kyn-border)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>{topicVideos.length} video{topicVideos.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '11px'
                  }}>
                    {topicVideos.map(video => {
                      const youtubeId = getYouTubeId(video.youtube_url)
                      const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null
                      return (
                        <Link key={video.id} href={`/videos/${video.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', overflow: 'hidden', transition: 'box-shadow 0.15s ease', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                          >
                            <div style={{ width: '100%', paddingTop: '56.25%', background: thumbnailUrl ? `url(${thumbnailUrl}) center/cover` : 'var(--kyn-surface-raised)', position: 'relative', borderRadius: 'var(--kyn-r-lg) var(--kyn-r-lg) 0 0', overflow: 'hidden' }}>
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'var(--kyn-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg style={{ width: '20px', height: '20px', color: '#fff' }} fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                              </div>
                              <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 8px', background: getStatusColor(video.status), borderRadius: '8px', fontSize: '9.5px', fontWeight: 700, color: getStatusTextColor(video.status) }}>{getStatusLabel(video.status)}</div>
                            </div>
                            <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '5px', lineHeight: 1.4, color: 'var(--kyn-ink)' }}>{video.title}</h3>
                              <p style={{ fontSize: '12.5px', color: 'var(--kyn-ink2)', lineHeight: 1.6, marginBottom: '10px', flex: 1 }}>{video.description?.substring(0, 100)}{video.description?.length > 100 ? '...' : ''}</p>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--kyn-ink3)' }}>
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
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '11px'
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
                  background: 'var(--kyn-surface)',
                  border: '1px solid var(--kyn-border)',
                  borderRadius: 'var(--kyn-r-lg)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.15s ease',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '100%',
                    paddingTop: '56.25%',
                    background: thumbnailUrl
                      ? `url(${thumbnailUrl}) center/cover`
                      : 'var(--kyn-surface-raised)',
                    position: 'relative',
                    borderRadius: 'var(--kyn-r-lg) var(--kyn-r-lg) 0 0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--kyn-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg style={{ width: '20px', height: '20px', color: '#fff' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '2px 8px',
                      background: getStatusColor(video.status),
                      borderRadius: '8px',
                      fontSize: '9.5px',
                      fontWeight: 700,
                      color: getStatusTextColor(video.status)
                    }}>
                      {getStatusLabel(video.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      fontSize: '9.5px',
                      color: 'var(--kyn-green)',
                      marginBottom: '5px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 600
                    }}>
                      {video.category}
                    </div>
                    <h3 style={{
                      fontSize: '13.5px',
                      fontWeight: 600,
                      marginBottom: '5px',
                      lineHeight: 1.4,
                      color: 'var(--kyn-ink)'
                    }}>
                      {video.title}
                    </h3>
                    <p style={{
                      fontSize: '12.5px',
                      color: 'var(--kyn-ink2)',
                      lineHeight: 1.6,
                      marginBottom: '10px',
                      flex: 1
                    }}>
                      {video.description?.substring(0, 100)}{video.description?.length > 100 ? '...' : ''}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: 'var(--kyn-ink3)'
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
