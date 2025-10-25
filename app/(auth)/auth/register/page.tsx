'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      logger.debug('Register', 'Starting registration...')
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      logger.debug('Register', 'Response received', res.status)
      const data = await res.json()

      if (!res.ok) {
        console.error('[Register] Registration failed:', data.error)
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      logger.debug('Register', 'Registration successful')
      // Auto-login after successful registration
      localStorage.removeItem('user')
      localStorage.setItem('user', JSON.stringify(data.user))
      logger.debug('Register', 'Redirecting to /journey...')

      window.location.replace('/journey')
    } catch (err) {
      console.error('[Register] Error:', err)
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
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
              Join the Circle
            </p>
          </Link>

          {/* Register Card */}
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
              Begin Your Journey
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginBottom: '2rem',
              fontWeight: 300
            }}>
              Create your account to access the Circle
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
                <label htmlFor="name" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 300,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '0.5rem'
                }}>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  placeholder="John Doe"
                  onFocus={(e) => e.target.style.borderColor = 'rgba(155, 196, 184, 0.3)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  placeholder="Minimum 8 characters"
                  onFocus={(e) => e.target.style.borderColor = 'rgba(155, 196, 184, 0.3)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 300,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '0.5rem'
                }}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                  placeholder="Re-enter password"
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
                {loading ? 'Creating Account...' : 'Join the Circle'}
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 300
              }}>
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  style={{
                    color: 'rgba(155, 196, 184, 0.8)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#9bc4b8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(155, 196, 184, 0.8)'}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '0.75rem',
            marginTop: '2rem',
            fontWeight: 300
          }}>
            <Link
              href="/"
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
            >
              ← Back to home
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
