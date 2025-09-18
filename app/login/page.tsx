'use client'
import { useState } from 'react'
import Navigation from '../components/Navigation'
import { Eye, EyeOff } from 'lucide-react'

const mockUsers = [
  { email: "mason@truenorth.com", password: "admin123", role: "admin", name: "Mason" },
  { email: "member@example.com", password: "member123", role: "member", name: "John Doe" }
]

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    
    const foundUser = mockUsers.find(u => 
      u.email === loginData.email && u.password === loginData.password
    )
    
    if (foundUser) {
      localStorage.setItem('truenorthUser', JSON.stringify(foundUser))
      if (foundUser.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/journey'
      }
    } else {
      setLoginError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#9bc4b8] to-[#7fb069] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-black">★</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">True North Community</h1>
            <p className="text-white/60">Sign in to access your journey</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#9bc4b8]/50"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#9bc4b8]/50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {loginError}
                </div>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-3 bg-gradient-to-r from-[#9bc4b8] to-[#7fb069] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-white/60 text-sm mb-3">Demo Accounts:</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/80">Admin:</span>
                  <span className="text-[#9bc4b8]">mason@truenorth.com / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Member:</span>
                  <span className="text-[#9bc4b8]">member@example.com / member123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}