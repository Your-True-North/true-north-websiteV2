'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CommunityPage() {
  const [user, setUser] = useState({ name: 'MASON' })

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Hero Section */}
      <div style={{ background: '#f5f5f5', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontFamily: 'Gambarino, serif',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: '2rem'
          }}>
            Welcome back, {user.name}
          </h1>
          
          {/* Stats Grid */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{ borderLeft: '3px solid #e67e22', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a1a' }}>2/10</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }}>
                Foundation Videos
              </div>
            </div>
            <div style={{ borderLeft: '3px solid #e67e22', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a1a' }}>5</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }}>
                Posts Created
              </div>
            </div>
            <div style={{ borderLeft: '3px solid #e67e22', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a1a' }}>12</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }}>
                Community Replies
              </div>
            </div>
          </div>

          {/* Next Video Card */}
          <div style={{
            background: '#f5f5f5',
            border: '2px solid #e0e0e0',
            borderRadius: '6px',
            padding: '2.5rem',
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: '2.5rem',
            alignItems: 'center'
          }}>
            <div style={{
              width: '200px',
              height: '112px',
              background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: '#fff'
            }}>▶</div>
            <div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#e67e22',
                marginBottom: '0.5rem'
              }}>
                Continue Your Journey
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1a1a1a',
                marginBottom: '0.75rem'
              }}>
                Understanding the Nervous System
              </h2>
              <button style={{
                padding: '1rem 2rem',
                background: '#e67e22',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: '4px'
              }}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Community Feed */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{
          fontFamily: 'Gambarino, serif',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: '2rem'
        }}>
          Community Feed
        </h2>
        
        <div style={{
          background: '#ffffff',
          border: '2px solid #e5e5e5',
          borderRadius: '6px',
          padding: '2rem'
        }}>
          <p style={{ color: '#666', textAlign: 'center' }}>Community posts will appear here</p>
        </div>
      </div>
    </div>
  )
}
