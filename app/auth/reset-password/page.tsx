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
      const res = await fetch('/api/auth/reset-password', {
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
        <Link href="/auth/login" style={{ display: 'block', textAlign: 'center', marginBottom: '2rem', color: '#fff', textDecoration: 'none' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '0.5rem' }}>Reset Password</h1>
        </Link>

        {sent ? (
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>Check your email</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>We've sent password reset instructions to {email}</p>
            <Link href="/auth/login" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#9bc4b8', textDecoration: 'none' }}>
              Back to login
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
              
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1.5rem' }}
                placeholder="your@email.com"
              />
              
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #9bc4b8, #7fb069)', color: '#000', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <Link href="/auth/login" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem', textDecoration: 'none' }}>
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
