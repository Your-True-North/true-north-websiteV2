'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/members')
    } catch (err) {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 bg-[#0a0a0b]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="block text-center mb-12 group">
            <h1 className="text-3xl font-light text-white tracking-wider mb-2 group-hover:opacity-80 transition-opacity">
              TRUE NORTH
            </h1>
            <p className="text-sm text-white/40 font-light tracking-wide">Member Portal</p>
          </Link>

          {/* Login Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-md p-8 shadow-2xl">
            <h2 className="text-2xl font-light text-white mb-2 text-center">Welcome Back</h2>
            <p className="text-white/50 text-sm text-center mb-8 font-light">
              Continue your transformation journey
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-red-400 text-sm font-light">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-light text-white/70 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all font-light disabled:opacity-50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-light text-white/70 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all font-light disabled:opacity-50"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black font-light rounded-md hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Accessing Portal...' : 'Enter Portal'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link 
                href="/" 
                className="text-sm text-white/50 hover:text-white/80 transition-colors font-light inline-flex items-center gap-2"
              >
                <span>←</span> Back to home
              </Link>
            </div>
          </div>

          <p className="text-center text-white/30 text-xs mt-8 font-light">
            Need access? <Link href="/circle" className="text-white/50 hover:text-white/80 transition-colors">Join the Circle</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
