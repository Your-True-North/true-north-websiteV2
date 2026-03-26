'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotificationsPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/members')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (!adminData) { router.push('/admin/login'); return }
    try {
      const parsed = JSON.parse(adminData)
      if (parsed.role !== 'admin') router.push('/admin/login')
    } catch { router.push('/admin/login') }
  }, [router])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setResult(null)
    setError('')
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_SECRET || '',
        },
        body: JSON.stringify({ title, body, url }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setTitle('')
        setBody('')
        setUrl('/members')
      } else {
        setError(data.error || 'Failed to send')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a' }}>
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e5e5', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>Send Notification</h1>
          <p style={{ fontSize: '14px', color: '#666' }}>Push a message to all CoR members</p>
        </div>
        <Link href="/admin/dashboard" style={{ padding: '10px 20px', background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: '3px', color: '#1a1a1a', fontSize: '14px', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </div>

      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 40px' }}>
        <form onSubmit={handleSend} style={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="New video posted"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={3}
              placeholder="A new session is available in your library."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Link (optional)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/members"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ color: '#e53e3e', fontSize: '14px', margin: 0 }}>{error}</p>}

          {result && (
            <div style={{ padding: '12px 16px', background: 'rgba(127, 176, 105, 0.1)', border: '1px solid rgba(127, 176, 105, 0.3)', borderRadius: '4px', fontSize: '14px', color: '#2d6a1f' }}>
              Sent to {result.sent} member{result.sent !== 1 ? 's' : ''}{result.failed > 0 ? ` (${result.failed} failed)` : ''}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !title || !body}
            style={{ padding: '12px 24px', background: sending || !title || !body ? '#ddd' : '#1a1a1a', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: sending || !title || !body ? 'not-allowed' : 'pointer' }}
          >
            {sending ? 'Sending...' : 'Send to All Members'}
          </button>
        </form>
      </div>
    </div>
  )
}
