'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Video {
  id: number
  title: string
  description: string
  youtube_url: string
  youtubeId: string
  category: string
  duration: string
  upload_date: string
}

export default function ReplaysPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [replays, setReplays] = useState<Video[]>([])
  const [filteredReplays, setFilteredReplays] = useState<Video[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/login')
      return
    }
    fetchReplays()
  }, [router])

  useEffect(() => {
    filterAndSortReplays()
  }, [replays, searchQuery, sortBy])

  const fetchReplays = async () => {
    try {
      const res = await fetch('/api/videos?category=Live Teachings')
      const data = await res.json()

      if (res.ok && data.videos) {
        setReplays(data.videos)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching replays:', error)
      setLoading(false)
    }
  }

  const filterAndSortReplays = () => {
    let filtered = [...replays]

    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.upload_date).getTime()
      const dateB = new Date(b.upload_date).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    setFilteredReplays(filtered)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--kyn-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--kyn-ink3)',
        fontFamily: 'var(--kyn-font-sans)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-sans)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px 14px 72px' : '28px 32px 52px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <Link
            href="/members"
            style={{
              color: 'var(--kyn-green)',
              textDecoration: 'none',
              fontSize: '13px',
              marginBottom: '12px',
              display: 'inline-block'
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 400,
            marginBottom: '8px',
            color: 'var(--kyn-ink)',
            fontFamily: 'var(--kyn-font-serif)'
          }}>
            Live Session Replays
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--kyn-ink2)', lineHeight: 1.6 }}>
            Catch up on past live teaching sessions and community calls
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '10px',
          marginBottom: '18px'
        }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search replays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--kyn-surface)',
                border: '1px solid var(--kyn-border)',
                borderRadius: 'var(--kyn-r)',
                color: 'var(--kyn-ink)',
                fontSize: '13.5px',
                outline: 'none',
                fontFamily: 'var(--kyn-font-sans)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--kyn-border-green)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--kyn-border)'}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
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
          </select>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: '18px', fontSize: '12px', color: 'var(--kyn-ink3)' }}>
          {filteredReplays.length} {filteredReplays.length === 1 ? 'replay' : 'replays'} found
        </div>

        {/* Replays Grid */}
        {filteredReplays.length === 0 ? (
          <div style={{
            padding: '48px 28px',
            background: 'var(--kyn-surface)',
            border: '1px solid var(--kyn-border)',
            borderRadius: 'var(--kyn-r-lg)',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <p style={{ fontSize: '13.5px', color: 'var(--kyn-ink3)', marginBottom: '8px' }}>
              {searchQuery ? 'No replays match your search' : 'No replays available yet'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  marginTop: '14px',
                  padding: '7px 16px',
                  background: 'transparent',
                  border: '1px solid var(--kyn-border-mid)',
                  borderRadius: 'var(--kyn-r)',
                  color: 'var(--kyn-ink2)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: 'var(--kyn-font-sans)'
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '11px'
          }}>
            {filteredReplays.map(video => (
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
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  {/* Video Thumbnail */}
                  <div style={{
                    width: '100%',
                    paddingTop: '56.25%',
                    background: video.youtubeId
                      ? `url(https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg)`
                      : 'var(--kyn-surface-raised)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    borderRadius: 'var(--kyn-r-lg) var(--kyn-r-lg) 0 0',
                    overflow: 'hidden'
                  }}>
                    {/* Play Button */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'var(--kyn-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                      <svg style={{ width: '22px', height: '22px', color: '#fff', marginLeft: '3px' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>

                    {/* Live badge */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      padding: '2px 7px',
                      background: 'var(--kyn-blue-bg)',
                      border: '1px solid var(--kyn-border-blue)',
                      borderRadius: '8px',
                      fontSize: '9.5px',
                      fontWeight: 700,
                      color: 'var(--kyn-blue)'
                    }}>
                      RECORDED
                    </div>

                    {video.duration && (
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        padding: '3px 7px',
                        background: 'rgba(0,0,0,0.75)',
                        borderRadius: 'var(--kyn-r)',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#fff'
                      }}>
                        {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                      fontSize: '13.5px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: 'var(--kyn-ink)',
                      lineHeight: 1.4
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
                      {video.description?.substring(0, 120)}{video.description?.length > 120 ? '...' : ''}
                    </p>
                    <div style={{ fontSize: '11px', color: 'var(--kyn-ink3)' }}>
                      {new Date(video.upload_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
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
