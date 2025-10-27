'use client'
import { useState } from 'react'

export default function AdminReset() {
  const [newPassword, setNewPassword] = useState('')
  const [result, setResult] = useState('')

  const handleReset = async () => {
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'Navigate@yourtruenorth.me',
        newPassword 
      })
    })
    const data = await res.json()
    setResult(JSON.stringify(data, null, 2))
  }

  return (
    <div style={{ padding: '2rem', background: '#0a0a0b', minHeight: '100vh', color: '#fff' }}>
      <h1>Reset Navigate Password</h1>
      <input
        type="text"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        style={{ padding: '1rem', width: '300px', marginRight: '1rem' }}
      />
      <button onClick={handleReset} style={{ padding: '1rem 2rem', cursor: 'pointer' }}>
        Reset Password
      </button>
      {result && <pre style={{ marginTop: '2rem', background: '#222', padding: '1rem' }}>{result}</pre>}
    </div>
  )
}
