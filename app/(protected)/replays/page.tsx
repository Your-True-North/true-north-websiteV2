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

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort by date
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
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#1a1a1a', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '20px 16px' : '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/members"
            style={{
              color: '#e67e22',
              textDecoration: 'none',
              fontSize: '14px',
              marginBottom: '12px',
              display: 'inline-block'
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            Live Session Replays
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666'
          }}>
            Catch up on past live teaching sessions and community calls
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Search Input */}
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search replays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                color: '#1a1a1a',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.3)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              color: '#1a1a1a',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Results Count */}
        <div style={{
          marginBottom: '24px',
          fontSize: '14px',
          color: '#999'
        }}>
          {filteredReplays.length} {filteredReplays.length === 1 ? 'replay' : 'replays'} found
        </div>

        {/* Replays Grid */}
        {filteredReplays.length === 0 ? (
          <div style={{
            padding: '64px 32px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🎥
            </div>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '8px'
            }}>
              {searchQuery ? 'No replays match your search' : 'No replays available yet'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: 'rgba(155, 196, 184, 0.1)',
                  border: '1px solid rgba(155, 196, 184, 0.3)',
                  borderRadius: '3px',
                  color: '#e67e22',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {filteredReplays.map(video => (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
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
                  {/* Video Thumbnail */}
                  <div style={{
                    width: '100%',
                    paddingTop: '56.25%',
                    background: video.youtubeId
                      ? `url(https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg)`
                      : 'rgba(0, 0, 0, 0.5)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    {/* Play Button Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e67e22, #7fb069)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}>
                      <svg style={{ width: '32px', height: '32px', color: '#000', marginLeft: '4px' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        padding: '4px 8px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        borderRadius: '3px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      marginBottom: '8px',
                      color: '#1a1a1a',
                      lineHeight: 1.4
                    }}>
                      {video.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: 1.6,
                      marginBottom: '12px',
                      flex: 1
                    }}>
                      {video.description?.substring(0, 120)}{video.description?.length > 120 ? '...' : ''}
                    </p>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.4)'
                    }}>
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
