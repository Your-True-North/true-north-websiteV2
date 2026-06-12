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
      case 'completed': return 'Completed'
      case 'in_progress': return 'In Progress'
      default: return 'New'
    }
  }

  const TOPICS = ['The Psyche', 'Somatic Experiencing', 'Anger', 'Addiction', 'Spirituality', 'Masculinity']

  const normaliseCategory = (cat: string): string => {
    const map: { [key: string]: string } = {
      'Foundation Work': 'Spirituality',
      'Live Teachings': 'Masculinity',
      'Integration Practices': 'The Psyche',
      'Breathwork Sessions': 'Somatic Experiencing',
      'Somatic Work': 'Somatic Experiencing',
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

  // Derived for new layout
  const FILTER_PILLS = ['All', ...TOPICS, 'Live Replays']
  const isReplaysActive = selectedCategory === 'Live Replays'
  const filteredTeachings = isReplaysActive
    ? []
    : teachingsVideos.filter(v => selectedCategory === 'all' || v.category === selectedCategory)

  const inProgressWatching = continueWatching.filter((v: any) => v.percentage > 0 && v.percentage < 100)

  const isNewVideo = (uploadDate: string) => {
    return new Date(uploadDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  }

  const parseDurationMins = (duration: string): number => {
    if (!duration) return 0
    const match = duration.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--kyn-ink3)', fontFamily: 'var(--kyn-font-sans)', fontWeight: 300 }}>Loading library...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-sans)' }}>
      <style>{`
        .kyn-no-scroll::-webkit-scrollbar { display: none; }
        .kyn-no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px 14px 72px' : '28px 32px 52px' }}>

        {/* 1. Page title block */}
        <div style={{
          paddingBottom: '17px',
          borderBottom: '1px solid var(--kyn-border)',
          marginBottom: '20px'
        }}>
          <h1 style={{
            fontFamily: 'var(--kyn-font-serif)',
            fontSize: '22px',
            fontWeight: 400,
            color: 'var(--kyn-ink)',
            margin: '0 0 4px 0',
            lineHeight: 1.2
          }}>
            Teachings
          </h1>
          <p style={{
            fontSize: '12px',
            fontStyle: 'italic',
            color: 'var(--kyn-ink3)',
            margin: 0
          }}>
            Videos, guides and live session replays
          </p>
        </div>

        {/* 2. Search bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <svg
            style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--kyn-ink3)', pointerEvents: 'none' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              background: 'var(--kyn-surface-raised)',
              border: '1px solid var(--kyn-border)',
              borderRadius: 'var(--kyn-r-lg)',
              color: 'var(--kyn-ink)',
              fontSize: '13.5px',
              outline: 'none',
              fontFamily: 'var(--kyn-font-sans)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* 3. Topic filter pills */}
        <div
          className="kyn-no-scroll"
          style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px' }}
        >
          {FILTER_PILLS.map(pill => {
            const key = pill === 'All' ? 'all' : pill
            const isActive = selectedCategory === key
            return (
              <button
                key={pill}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: '6px 14px',
                  background: isActive ? 'var(--kyn-green-bg)' : 'var(--kyn-surface)',
                  border: `1px solid ${isActive ? 'var(--kyn-border-green)' : 'var(--kyn-border)'}`,
                  borderRadius: '20px',
                  color: isActive ? 'var(--kyn-green)' : 'var(--kyn-ink2)',
                  fontSize: '12px',
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontFamily: 'var(--kyn-font-sans)',
                  transition: 'all 0.1s ease'
                }}
              >
                {pill}
              </button>
            )
          })}
        </div>

        {/* 4. Continue watching — only if in-progress videos exist */}
        {inProgressWatching.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.11em',
              textTransform: 'uppercase',
              color: 'var(--kyn-ink3)',
              marginBottom: '10px'
            }}>
              Continue Watching
            </div>
            <div
              className="kyn-no-scroll"
              style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}
            >
              {inProgressWatching.map((video: any) => {
                const youtubeId = getYouTubeId(video.youtube_url)
                const thumbUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null
                const totalMins = parseDurationMins(video.duration)
                const remainingMins = totalMins > 0 ? Math.round(totalMins * (1 - video.percentage / 100)) : null
                return (
                  <Link
                    key={video.id}
                    href={`/videos/${video.id}`}
                    style={{
                      flexShrink: 0,
                      width: isMobile ? '240px' : '220px',
                      background: 'var(--kyn-surface)',
                      border: '1px solid var(--kyn-border)',
                      borderRadius: 'var(--kyn-r-lg)',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block'
                    }}
                  >
                    <div style={{
                      width: '100%', height: '130px',
                      background: thumbUrl ? `url(${thumbUrl}) center/cover` : 'var(--kyn-sidebar)',
                      position: 'relative', overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'rgba(45,106,79,0.3)',
                        border: '1.5px solid rgba(82,183,136,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <svg style={{ width: '14px', height: '14px', color: '#fff', marginLeft: '2px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.1)' }}>
                        <div style={{ height: '100%', width: `${video.percentage}%`, background: 'var(--kyn-green-hi)' }} />
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px 12px' }}>
                      <div style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--kyn-green)', marginBottom: '4px' }}>
                        {normaliseCategory(video.category || '')}
                      </div>
                      <div style={{
                        fontSize: '13px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.4, marginBottom: '5px',
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                      }}>
                        {video.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>
                        {Math.round(video.percentage)}%{remainingMins ? ` · ${remainingMins} min remaining` : ''}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* 5. All teachings — hidden when Live Replays pill is active */}
        {!isReplaysActive && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--kyn-ink3)' }}>
                All Teachings
              </div>
              <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>
                {filteredTeachings.length} video{filteredTeachings.length !== 1 ? 's' : ''}
              </div>
            </div>

            {filteredTeachings.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--kyn-ink3)', fontSize: '13.5px' }}>
                {searchQuery ? `No videos found for "${searchQuery}"` : 'No videos in this category yet.'}
              </div>
            ) : !isMobile ? (
              /* Desktop 3-col grid */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {filteredTeachings.map(video => {
                  const youtubeId = getYouTubeId(video.youtube_url)
                  const thumbUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null
                  const isNew = isNewVideo(video.upload_date)
                  const progress = (video as any).percentage || 0
                  return (
                    <Link key={video.id} href={`/videos/${video.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <div
                        style={{
                          background: 'var(--kyn-surface)',
                          border: '1px solid var(--kyn-border)',
                          borderRadius: 'var(--kyn-r-lg)',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{
                          aspectRatio: '16/9',
                          background: thumbUrl ? `url(${thumbUrl}) center/cover` : 'var(--kyn-sidebar)',
                          position: 'relative', overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%,-50%)',
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(45,106,79,0.3)',
                            border: '1.5px solid rgba(82,183,136,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <svg style={{ width: '12px', height: '12px', color: '#fff', marginLeft: '2px' }} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                          {video.duration && (
                            <div style={{
                              position: 'absolute', bottom: '6px', right: '6px',
                              background: 'rgba(0,0,0,0.65)', color: '#fff',
                              fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 500
                            }}>{video.duration}</div>
                          )}
                          {isNew && (
                            <div style={{
                              position: 'absolute', top: '6px', left: '6px',
                              background: 'var(--kyn-green)', color: '#fff',
                              fontSize: '9px', padding: '2px 6px', borderRadius: '3px',
                              fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase'
                            }}>New</div>
                          )}
                          {progress > 0 && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)' }}>
                              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--kyn-green-hi)' }} />
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '12px 13px 13px' }}>
                          <div style={{ fontSize: '9.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--kyn-green)', marginBottom: '4px' }}>
                            {video.category}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.4, marginBottom: '6px' }}>
                            {video.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>{video.duration || '—'}</span>
                            <span>·</span>
                            <span>{new Date(video.upload_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              /* Mobile single-column list */
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredTeachings.map((video, idx) => {
                  const youtubeId = getYouTubeId(video.youtube_url)
                  const thumbUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null
                  const progress = (video as any).percentage || 0
                  const isLast = idx === filteredTeachings.length - 1
                  return (
                    <Link key={video.id} href={`/videos/${video.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{
                        display: 'flex', gap: '12px', padding: '11px 0',
                        borderBottom: isLast ? 'none' : '1px solid var(--kyn-border)'
                      }}>
                        <div style={{
                          width: '88px', height: '52px', flexShrink: 0,
                          borderRadius: 'var(--kyn-r)',
                          background: thumbUrl ? `url(${thumbUrl}) center/cover` : 'var(--kyn-sidebar)',
                          position: 'relative', overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%,-50%)',
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: 'rgba(45,106,79,0.3)',
                            border: '1.5px solid rgba(82,183,136,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <svg style={{ width: '8px', height: '8px', color: '#fff', marginLeft: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                          {video.duration && (
                            <div style={{
                              position: 'absolute', bottom: '3px', right: '3px',
                              background: 'rgba(0,0,0,0.65)', color: '#fff',
                              fontSize: '9px', padding: '1px 4px', borderRadius: '2px', fontWeight: 500
                            }}>{video.duration}</div>
                          )}
                          {progress > 0 && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)' }}>
                              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--kyn-green-hi)' }} />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--kyn-green)', marginBottom: '3px', fontWeight: 600 }}>
                            {video.category}
                          </div>
                          <div style={{
                            fontSize: '13px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.4,
                            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                          }}>
                            {video.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)', marginTop: '3px' }}>
                            {video.duration || '—'} · {new Date(video.upload_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. Live replays section — shown when Live Replays pill active */}
        {isReplaysActive && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--kyn-ink3)' }}>
                Live Call Replays
              </div>
              <Link href="/replays" style={{ fontSize: '12px', color: 'var(--kyn-green)', textDecoration: 'none' }}>
                View all
              </Link>
            </div>

            {replayVideos.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--kyn-ink3)', fontSize: '13.5px' }}>
                No replays posted yet. Check back after the next live call.
              </div>
            ) : !isMobile ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '11px' }}>
                {replayVideos.map(video => {
                  const youtubeId = getYouTubeId(video.youtube_url)
                  const thumbUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null
                  return (
                    <Link key={video.id} href={`/videos/${video.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div
                        style={{
                          display: 'flex',
                          background: 'var(--kyn-surface)',
                          border: '1px solid var(--kyn-border)',
                          borderRadius: 'var(--kyn-r-lg)',
                          overflow: 'hidden',
                          transition: 'box-shadow 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <div style={{
                          width: '100px', height: '70px', flexShrink: 0,
                          background: thumbUrl ? `url(${thumbUrl}) center/cover` : 'var(--kyn-sidebar)',
                          position: 'relative', overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute', bottom: '4px', left: '4px',
                            background: 'var(--kyn-blue)', color: '#fff',
                            fontSize: '8.5px', padding: '2px 5px', borderRadius: '2px',
                            fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase'
                          }}>Recorded</div>
                        </div>
                        <div style={{ padding: '10px 13px', flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '12.5px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.4,
                            marginBottom: '5px',
                            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                          }}>
                            {video.title}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--kyn-ink3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>{new Date(video.upload_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {video.duration && <><span>·</span><span>{video.duration}</span></>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {replayVideos.map((video, idx) => {
                  const youtubeId = getYouTubeId(video.youtube_url)
                  const thumbUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null
                  const isLast = idx === replayVideos.length - 1
                  return (
                    <Link key={video.id} href={`/videos/${video.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{
                        display: 'flex', gap: '12px', padding: '11px 0',
                        borderBottom: isLast ? 'none' : '1px solid var(--kyn-border)'
                      }}>
                        <div style={{
                          width: '88px', height: '52px', flexShrink: 0,
                          borderRadius: 'var(--kyn-r)',
                          background: thumbUrl ? `url(${thumbUrl}) center/cover` : 'var(--kyn-sidebar)',
                          position: 'relative', overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute', bottom: '3px', left: '3px',
                            background: 'var(--kyn-blue)', color: '#fff',
                            fontSize: '8px', padding: '1px 4px', borderRadius: '2px',
                            fontWeight: 700, textTransform: 'uppercase'
                          }}>Rec</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.4,
                            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            marginBottom: '3px'
                          }}>
                            {video.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>
                            {new Date(video.upload_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            {video.duration && ` · ${video.duration}`}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
