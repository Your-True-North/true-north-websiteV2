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

  const isReplaysActive = selectedCategory === 'Live Replays'
  const teachingsVideos = (selectedCategory === 'all' ? videos : videos.filter(v => normaliseCategory(v.category) === selectedCategory)).filter(v => normaliseCategory(v.category) !== 'Live Replays').filter(v => !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const replayVideos = videos.filter(v => normaliseCategory(v.category) === 'Live Replays')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--kyn-ink3)', fontFamily: 'var(--kyn-font-sans)', fontWeight: 300 }}>Loading library...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-sans)' }}>
      <style>{`.kyn-no-scroll::-webkit-scrollbar{display:none;}.kyn-no-scroll{-ms-overflow-style:none;scrollbar-width:none;}`}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px 14px 72px' : '28px 32px 52px' }}>

        {/* PAGE TITLE */}
        <div style={{ paddingBottom: '17px', borderBottom: '1px solid var(--kyn-border)', marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'var(--kyn-font-serif)', fontSize: '22px', fontWeight: 400, color: 'var(--kyn-ink)', margin: '0 0 4px 0', lineHeight: 1.2 }}>Teachings</h1>
          <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--kyn-ink3)', margin: 0 }}>Videos, guides and live session replays</p>
        </div>

        {/* SEARCH */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--kyn-ink3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" placeholder="Search teachings..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '9px 12px 9px 36px', background: '#f0f0ee', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', fontSize: '13px', color: 'var(--kyn-ink)', outline: 'none', fontFamily: 'var(--kyn-font-sans)' }} />
        </div>

        {/* TOPIC PILLS */}
        <div className="kyn-no-scroll" style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
          {['All', ...TOPICS, 'Live Replays'].map(topic => {
            const val = topic === 'All' ? 'all' : topic
            const isActive = selectedCategory === val
            return (
              <button key={topic} onClick={() => setSelectedCategory(val)} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${isActive ? 'rgba(45,106,79,0.2)' : 'var(--kyn-border)'}`, background: isActive ? '#e8f4ee' : 'var(--kyn-surface)', color: isActive ? 'var(--kyn-green)' : 'var(--kyn-ink2)', fontWeight: isActive ? 500 : 400, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'var(--kyn-font-sans)', transition: 'all 0.12s' }}>
                {topic}
              </button>
            )
          })}
        </div>

        {/* CONTINUE WATCHING */}
        {!isReplaysActive && continueWatching.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: isMobile ? '11px' : '10px', fontWeight: 600, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--kyn-ink3)', marginBottom: '10px' }}>Continue watching</div>
            <div>
              {continueWatching.map((video: any) => {
                const pct = video.percentage || 0
                const durationMin = parseInt(video.duration)
                const remaining = !isNaN(durationMin) && durationMin > 0 ? Math.round(durationMin * (1 - pct / 100)) : null
                return (
                  <a key={video.id} href={`/videos/${video.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', marginBottom: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textDecoration: 'none' }}>
                    <div style={{ width: '96px', height: '54px', flexShrink: 0, borderRadius: 'var(--kyn-r)', backgroundImage: `url(https://img.youtube.com/vi/${getYouTubeId(video.youtube_url)}/mqdefault.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(45,106,79,0.35)', border: '1.5px solid rgba(82,183,136,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '10px', height: '10px', color: '#52b788', marginLeft: '1px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.15)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#52b788' }} />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? '11px' : '9.5px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--kyn-green)', marginBottom: '3px' }}>{normaliseCategory(video.category)}</div>
                      <div style={{ fontSize: isMobile ? '15px' : '13px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.4, marginBottom: '3px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{video.title}</div>
                      <div style={{ fontSize: isMobile ? '12px' : '11px', color: 'var(--kyn-ink3)' }}>{pct}% complete{remaining ? ` · ${remaining} min remaining` : ''}</div>
                    </div>
                    <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: 600, color: 'var(--kyn-blue)', background: 'var(--kyn-blue-mid)', border: '1px solid var(--kyn-border-blue)', borderRadius: '20px', padding: '3px 10px', whiteSpace: 'nowrap' }}>In progress</span>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* ALL TEACHINGS */}
        {!isReplaysActive && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: isMobile ? '11px' : '10px', fontWeight: 600, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--kyn-ink3)' }}>All teachings</div>
              <span style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>{teachingsVideos.length} videos</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '0' : '14px' }}>
              {teachingsVideos.map(video => {
                const isNew = Date.now() - new Date(video.upload_date).getTime() < 7 * 24 * 60 * 60 * 1000
                const pct = (video as any).percentage || 0
                const thumbUrl = `url(https://img.youtube.com/vi/${getYouTubeId(video.youtube_url)}/mqdefault.jpg)`
                if (isMobile) return (
                  <a key={video.id} href={`/videos/${video.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: '1px solid var(--kyn-border)', textDecoration: 'none' }}>
                    <div style={{ width: '88px', height: '52px', borderRadius: 'var(--kyn-r)', flexShrink: 0, backgroundImage: thumbUrl, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {isNew && <div style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--kyn-green)', color: '#fff', fontSize: '8px', fontWeight: 700, padding: '1.5px 5px', borderRadius: '2px' }}>NEW</div>}
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(45,106,79,0.25)', border: '1px solid rgba(82,183,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '9px', height: '9px', color: '#52b788', marginLeft: '1px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
                      </div>
                      {video.duration && <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '9px', fontWeight: 500, padding: '1.5px 5px', borderRadius: '2px' }}>{video.duration}m</div>}
                      {pct > 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)' }}><div style={{ height: '100%', width: `${pct}%`, background: '#52b788' }} /></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--kyn-green)', marginBottom: '3px' }}>{normaliseCategory(video.category)}</div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.35, marginBottom: '3px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{video.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--kyn-ink3)' }}>{video.duration && `${video.duration} min`}{pct === 100 ? ' · Watched' : pct > 0 ? ' · In progress' : ''}</div>
                    </div>
                  </a>
                )
                return (
                  <a key={video.id} href={`/videos/${video.id}`} style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textDecoration: 'none', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                  >
                    <div style={{ width: '100%', aspectRatio: '16/9', backgroundImage: thumbUrl, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isNew && <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--kyn-green)', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', letterSpacing: '0.04em' }}>NEW</div>}
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(45,106,79,0.3)', border: '1.5px solid rgba(82,183,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '14px', height: '14px', color: '#52b788', marginLeft: '2px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
                      </div>
                      {video.duration && <div style={{ position: 'absolute', bottom: '7px', right: '8px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '10px', fontWeight: 500, padding: '2px 6px', borderRadius: '3px' }}>{video.duration} min</div>}
                      {pct > 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)' }}><div style={{ height: '100%', width: `${pct}%`, background: '#52b788' }} /></div>}
                    </div>
                    <div style={{ padding: '12px 13px 13px' }}>
                      <div style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--kyn-green)', marginBottom: '4px' }}>{normaliseCategory(video.category)}</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.4, marginBottom: '5px' }}>{video.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {video.duration && <span>{video.duration} min</span>}
                        {pct === 100 && <><span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--kyn-ink3)', display: 'inline-block' }} /><span>Watched</span></>}
                        {pct > 0 && pct < 100 && <><span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--kyn-ink3)', display: 'inline-block' }} /><span>In progress</span></>}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* LIVE REPLAYS */}
        {(isReplaysActive || replayVideos.length > 0) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: isMobile ? '11px' : '10px', fontWeight: 600, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--kyn-ink3)' }}>Live call replays</div>
              {!isReplaysActive && <span style={{ fontSize: '11px', color: 'var(--kyn-green)', cursor: 'pointer' }} onClick={() => setSelectedCategory('Live Replays')}>View all</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '0' : '12px' }}>
              {replayVideos.map(video => {
                const thumbUrl = `url(https://img.youtube.com/vi/${getYouTubeId(video.youtube_url)}/mqdefault.jpg)`
                if (isMobile) return (
                  <a key={video.id} href={`/videos/${video.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: '1px solid var(--kyn-border)', textDecoration: 'none' }}>
                    <div style={{ width: '88px', height: '52px', borderRadius: 'var(--kyn-r)', flexShrink: 0, backgroundImage: thumbUrl, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(45,106,79,0.25)', border: '1px solid rgba(82,183,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '9px', height: '9px', color: '#52b788', marginLeft: '1px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
                      </div>
                      <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#3b82c8', color: '#fff', fontSize: '8px', fontWeight: 700, padding: '1.5px 5px', borderRadius: '2px' }}>RECORDED</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.35, marginBottom: '3px' }}>{video.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--kyn-ink3)' }}>{video.duration && `${video.duration} min`}</div>
                    </div>
                  </a>
                )
                return (
                  <a key={video.id} href={`/videos/${video.id}`} style={{ display: 'flex', background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: 'var(--kyn-r-lg)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textDecoration: 'none', transition: 'box-shadow 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
                  >
                    <div style={{ width: '100px', height: '70px', flexShrink: 0, backgroundImage: thumbUrl, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(45,106,79,0.25)', border: '1px solid rgba(82,183,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '10px', height: '10px', color: '#52b788', marginLeft: '1px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
                      </div>
                      <div style={{ position: 'absolute', bottom: '5px', left: '5px', background: '#3b82c8', color: '#fff', fontSize: '8.5px', fontWeight: 700, padding: '1.5px 5px', borderRadius: '3px' }}>RECORDED</div>
                    </div>
                    <div style={{ padding: '10px 13px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--kyn-ink)', lineHeight: 1.4, marginBottom: '4px' }}>{video.title}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--kyn-ink3)' }}>{video.duration && `${video.duration} min`}</div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
