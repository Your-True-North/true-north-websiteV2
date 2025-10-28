'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CallsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/login')
      return
    }
    setLoading(false)
  }, [router])

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

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/members"
            style={{
              color: '#9bc4b8',
              textDecoration: 'none',
              fontSize: '14px',
              marginBottom: '12px',
              display: 'inline-block'
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            Live Calls
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            Join monthly live sessions with Mason and guest experts
          </p>
        </div>

        {/* Upcoming Calls Section */}
        <div style={{
          padding: '32px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '24px',
            color: '#9bc4b8'
          }}>
            Book Your Spot
          </h2>

          {/* Calendly Embed */}
          <div style={{
            background: '#fff',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <iframe
              src="https://calendly.com/callwithmason/circle-live-call"
              width="100%"
              height="700"
              frameBorder="0"
              style={{ border: 'none', borderRadius: '6px' }}
            />
          </div>
        </div>

        {/* Call Replays Section */}
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '24px',
            color: '#9bc4b8'
          }}>
            Call Replays
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Placeholder for future replays */}
            <div style={{
              padding: '32px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
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
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                No replays available yet. Join your first live call and replays will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
