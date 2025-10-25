'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/logger'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.email && user.id) {
          logger.debug('Login', 'User already logged in, redirecting to journey')
          window.location.replace('/journey')
          return
        }
      } catch (e) {
        console.error('[Login] Failed to parse user data')
        localStorage.removeItem('user')
      }
    }
    setCheckingAuth(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      logger.debug('Login', 'Starting login request...')
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      logger.debug('Login', 'Response received', res.status)
      const data = await res.json()
      logger.debug('Login', 'Data', data)

      if (!res.ok) {
        console.error('[Login] Login failed:', data.error)
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      logger.debug('Login', 'Saving to localStorage...')
      // Clear any stale data first
      localStorage.removeItem('user')
      // Set fresh user data
      localStorage.setItem('user', JSON.stringify(data.user))
      logger.debug('Login', 'User saved, redirecting to /journey...')

      // Use window.location.replace to prevent back button issues and cache problems
      window.location.replace('/journey')
    } catch (err) {
      console.error('[Login] Error:', err)
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 300 }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Mystical Background */}
      <div style={{ position: 'fixed', inset: 0, background: '#0a0a0b' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '24rem',
            height: '24rem',
            background: 'radial-gradient(circle, rgba(155, 196, 184, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(120px)',
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '25%',
            right: '25%',
            width: '24rem',
            height: '24rem',
            background: 'radial-gradient(circle, rgba(127, 176, 105, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(120px)',
            animation: 'pulse 4s ease-in-out infinite 700ms'
          }}></div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem'
      }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          {/* Logo */}
          <Link href="/" style={{
            display: 'block',
            textAlign: 'center',
            marginBottom: '4rem',
            textDecoration: 'none'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 300,
              color: '#fff',
              letterSpacing: '0.1em',
              marginBottom: '0.75rem',
              transition: 'opacity 0.3s ease'
            }}>
              The CoR
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}>
              Member Portal
            </p>
          </Link>

          {/* Login Card */}
          <div style={{
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 300,
              color: '#fff',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Welcome Back
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginBottom: '2rem',
              fontWeight: 300
            }}>
              Continue your transformation journey
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {error && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px'
                }}>
                  <p style={{
                    color: 'rgba(248, 113, 113, 1)',
                    fontSize: '0.875rem',
                    fontWeight: 300
                  }}>
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="email" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 300,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '0.5rem'
                }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 300,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    opacity: loading ? 0.5 : 1
                  }}
                  placeholder="your@email.com"
                  onFocus={(e) => e.target.style.borderColor = 'rgba(155, 196, 184, 0.3)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              <div>
                <label htmlFor="password" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 300,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '0.5rem'
                }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 300,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    opacity: loading ? 0.5 : 1
                  }}
                  placeholder="Enter your password"
                  onFocus={(e) => e.target.style.borderColor = 'rgba(155, 196, 184, 0.3)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                  color: '#000',
                  fontWeight: 500,
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {loading ? 'Accessing Portal...' : 'Enter Portal'}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <a
                  href="https://wa.me/447449052909?text=Hi%20Mason%2C%20I%20need%20help%20resetting%20my%20password%20for%20the%20Circle%20of%20Return%20member%20portal."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.875rem',
                    color: 'rgba(155, 196, 184, 0.8)',
                    textDecoration: 'none',
                    fontWeight: 300,
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(155, 196, 184, 1)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(155, 196, 184, 0.8)'}
                >
                  Forgot password? Contact Mason →
                </a>
              </div>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link 
                href="/" 
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textDecoration: 'none',
                  fontWeight: 300,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
              >
                <span>←</span> Back to home
              </Link>
            </div>
          </div>

          <p style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '0.75rem',
            marginTop: '2rem',
            fontWeight: 300
          }}>
            Need access? <Link 
              href="/circle" 
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(155, 196, 184, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
            >
              Join the Circle
            </Link>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
      `}} />
    </div>
  )
}
