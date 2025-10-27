#!/bin/bash
echo "=== Creating a test page to check cookies ==="
mkdir -p app/test-cookie
cat > app/test-cookie/page.tsx << 'TEST_EOF'
'use client'
import { useEffect, useState } from 'react'

export default function TestCookie() {
  const [cookies, setCookies] = useState('')
  const [allCookies, setAllCookies] = useState('')

  useEffect(() => {
    // Get all cookies
    setAllCookies(document.cookie)
    
    // Try to get auth_token specifically
    const value = `; ${document.cookie}`
    const parts = value.split(`; auth_token=`)
    if (parts.length === 2) {
      setCookies(parts.pop()?.split(';').shift() || 'not found')
    } else {
      setCookies('auth_token not found')
    }
  }, [])

  return (
    <div style={{ padding: '2rem', background: '#0a0a0b', minHeight: '100vh', color: '#fff' }}>
      <h1>Cookie Debug Page</h1>
      <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
        <h2>Auth Token:</h2>
        <pre>{cookies}</pre>
      </div>
      <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
        <h2>All Cookies:</h2>
        <pre>{allCookies || 'No cookies found'}</pre>
      </div>
    </div>
  )
}
TEST_EOF

git add app/test-cookie/page.tsx
git commit -m "Add cookie debug page"
git push origin main

echo "✅ Test page created at /test-cookie"
echo "After deployment, go to: https://true-north-website-v2-cni8.vercel.app/test-cookie"
