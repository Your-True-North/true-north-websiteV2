'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        setError('Failed to send reset email')
        setLoading(false)
        return
      }

      setSent(true)
      setLoading(false)
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#fff', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>Enter your email to receive reset instructions</p>
        </div>

        {sent ? (
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 500 }}>Check your email</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              We've sent password reset instructions to<br/><strong style={{ color: '#9bc4b8' }}>{email}</strong>
            </p>
            <Link href="/auth/login" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #9bc4b8, #7fb069)', color: '#000', fontWeight: 600, borderRadius: '8px', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
                </div>
              )}
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  placeholder="your@email.com"
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
                  fontWeight: 600, 
                  fontSize: '1rem',
                  borderRadius: '8px', 
                  border: 'none', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  opacity: loading ? 0.5 : 1 
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/auth/login" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem', textDecoration: 'none' }}>
                ← Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
