#!/bin/bash

# Get the current members page content
MEMBERS_FILE="app/(protected)/members/page.tsx"

# Create a backup
cp "$MEMBERS_FILE" "$MEMBERS_FILE.backup"

# Read the file and replace the authentication check
cat > "$MEMBERS_FILE" << 'MEMBERS_EOF'
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export default function MembersPage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication via cookie only
  useEffect(() => {
    logger.debug('Members', 'Checking authentication...')
    
    const authToken = getCookie('auth_token')
    
    if (!authToken) {
      logger.debug('Members', 'No auth token found, redirecting to login')
      window.location.replace('/auth/login')
      return
    }
    
    logger.debug('Members', 'User authenticated via cookie')
    setIsAuthenticated(true)
    setCheckingAuth(false)
  }, [])

  const handleLogout = () => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    window.location.replace('/')
  }

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 300 }}>Verifying access...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#9bc4b8', marginBottom: '0.5rem' }}>
            Circle of Return
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>Member Portal</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontWeight: 300
          }}
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '1rem' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6 }}>
            You're now part of the Circle of Return. Your transformation journey continues here.
          </p>
        </div>

        {/* Quick Links */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <Link href="/journey" style={{
            display: 'block',
            background: 'rgba(155, 196, 184, 0.1)',
            border: '1px solid rgba(155, 196, 184, 0.3)',
            borderRadius: '12px',
            padding: '2rem',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{ color: '#9bc4b8', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 400 }}>
              The Journey
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              Access videos, breathwork sessions, and teachings
            </p>
          </Link>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '2rem'
          }}>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 400 }}>
              Live Calls
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              Join weekly group sessions (Coming Soon)
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '2rem'
          }}>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 400 }}>
              Community
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              Connect with other members (Coming Soon)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
MEMBERS_EOF

echo "✅ Members page fixed - now checks auth_token cookie"
