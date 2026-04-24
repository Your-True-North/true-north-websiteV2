'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const EMAIL_META = [
  { number: 1, day: 1,  subject: "You'd rather tell people you're an alcoholic" },
  { number: 2, day: 4,  subject: "You haven't raised your voice in months and you're still angry" },
  { number: 3, day: 7,  subject: "Your anger is not the problem" },
  { number: 4, day: 10, subject: "I used to scare people" },
  { number: 5, day: 13, subject: "What your anger is actually costing you" },
  { number: 6, day: 17, subject: "10 men. 12 weeks. Let's go." },
  { number: 7, day: 19, subject: '"I can manage it myself"' },
  { number: 8, day: 24, subject: "You're not the only man carrying this" },
  { number: 9, day: 26, subject: "Last call" },
]

type Subscriber = { id: number; email: string; name: string; subscribed_at: string; unsubscribed: boolean; tags: string }
type Send = { email_number: number; sent_at: string; recipient_count: number }

export default function AngerCampaignPage() {
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [sends, setSends] = useState<Send[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [addResult, setAddResult] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState<number | null>(null)
  const [sendResult, setSendResult] = useState<Record<number, string>>({})
  const [confirmSend, setConfirmSend] = useState<number | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/auth/login'); return }
    try {
      const parsed = JSON.parse(userData)
      if (parsed.role !== 'admin') router.push('/members')
    } catch { router.push('/auth/login') }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [subRes, sendRes] = await Promise.all([
        fetch('/api/admin/anger-campaign/subscribers'),
        fetch('/api/admin/anger-campaign/send')
      ])
      const subData = await subRes.json()
      const sendData = await sendRes.json()
      setSubscribers(subData.subscribers || [])
      setSends(sendData.sends || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSubscriber(e: React.FormEvent) {
    e.preventDefault()
    setAddResult('')
    try {
      const res = await fetch('/api/admin/anger-campaign/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, name: newName })
      })
      const data = await res.json()
      if (res.ok) {
        setAddResult('Added successfully')
        setNewEmail('')
        setNewName('')
        fetchData()
      } else {
        setAddResult(data.error || 'Failed')
      }
    } catch {
      setAddResult('Error adding subscriber')
    }
  }

  async function handleUnsubscribe(email: string) {
    await fetch('/api/admin/anger-campaign/subscribers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    fetchData()
  }

  async function handleSend(emailNumber: number, isTest: boolean) {
    setSendingEmail(emailNumber)
    setSendResult(prev => ({ ...prev, [emailNumber]: '' }))
    setConfirmSend(null)
    try {
      const body: Record<string, unknown> = { emailNumber }
      if (isTest && testEmail) body.testEmail = testEmail
      const res = await fetch('/api/admin/anger-campaign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (res.ok) {
        const mode = data.mode === 'test' ? 'TEST - ' : ''
        setSendResult(prev => ({ ...prev, [emailNumber]: `${mode}Sent to ${data.sent} recipient${data.sent !== 1 ? 's' : ''}` }))
        fetchData()
      } else {
        setSendResult(prev => ({ ...prev, [emailNumber]: `Error: ${data.error}` }))
      }
    } catch {
      setSendResult(prev => ({ ...prev, [emailNumber]: 'Send failed' }))
    } finally {
      setSendingEmail(null)
    }
  }

  const activeCount = subscribers.filter(s => !s.unsubscribed).length

  const card: React.CSSProperties = {
    background: '#111113',
    border: '1px solid #222',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '16px'
  }

  const label: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '6px'
  }

  const input: React.CSSProperties = {
    width: '100%',
    background: '#1a1a1c',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '10px 14px',
    color: '#d4d0c8',
    fontSize: '14px',
    boxSizing: 'border-box'
  }

  const btn: React.CSSProperties = {
    background: '#9bc4b8',
    color: '#0a0a0b',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 24px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    letterSpacing: '0.5px'
  }

  const btnDanger: React.CSSProperties = {
    ...btn,
    background: '#c0392b',
    color: '#fff'
  }

  const btnSecondary: React.CSSProperties = {
    ...btn,
    background: '#2a2a2e',
    color: '#d4d0c8'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#d4d0c8', padding: '40px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <Link href="/admin" style={{ color: '#9bc4b8', textDecoration: 'none', fontSize: '14px' }}>← Admin</Link>
          <h1 style={{ margin: 0, fontSize: '24px', fontFamily: 'Georgia, serif', color: '#ffffff' }}>
            Men&apos;s Anger Programme - Email Campaign
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Active Subscribers', value: activeCount },
            { label: 'Total Subscribers', value: subscribers.length },
            { label: 'Emails Sent', value: sends.length }
          ].map(stat => (
            <div key={stat.label} style={{ background: '#111113', border: '1px solid #222', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: '32px', fontWeight: 700, color: '#9bc4b8' }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Test email input */}
        <div style={{ ...card, marginBottom: '32px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#888' }}>
            Set a test email address to send individual preview emails to yourself before sending to the list.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              style={{ ...input, flex: 1 }}
            />
            <button onClick={() => setTestEmail('')} style={btnSecondary}>Clear</button>
          </div>
          {testEmail && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#9bc4b8' }}>Test mode active - emails will go to {testEmail} only</p>}
        </div>

        {/* Email list */}
        <h2 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>The 7 Emails</h2>

        {EMAIL_META.map(email => {
          const sentRecord = sends.filter(s => s.email_number === email.number)
          const lastSent = sentRecord[0]
          const isSending = sendingEmail === email.number
          const result = sendResult[email.number]

          return (
            <div key={email.number} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>Day {email.day} - Email {email.number}</p>
                  <p style={{ margin: '0 0 8px', fontSize: '16px', color: '#d4d0c8', fontFamily: 'Georgia, serif' }}>{email.subject}</p>
                  {lastSent && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                      Last sent {new Date(lastSent.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to {lastSent.recipient_count} recipients
                    </p>
                  )}
                  {result && (
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: result.startsWith('Error') ? '#e74c3c' : '#7dcea0' }}>{result}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {testEmail && (
                    <button
                      onClick={() => handleSend(email.number, true)}
                      disabled={isSending}
                      style={btnSecondary}
                    >
                      {isSending ? 'Sending...' : 'Send Test'}
                    </button>
                  )}
                  {confirmSend === email.number ? (
                    <>
                      <button onClick={() => handleSend(email.number, false)} disabled={isSending} style={btnDanger}>
                        Confirm Send to {activeCount} subscribers
                      </button>
                      <button onClick={() => setConfirmSend(null)} style={btnSecondary}>Cancel</button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmSend(email.number)}
                      disabled={isSending || activeCount === 0}
                      style={btn}
                    >
                      Send to List
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Add subscriber */}
        <h2 style={{ fontSize: '16px', color: '#ffffff', margin: '40px 0 16px', letterSpacing: '1px', textTransform: 'uppercase' }}>Add Subscriber</h2>
        <div style={card}>
          <form onSubmit={handleAddSubscriber}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={label}>Email</label>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} style={input} />
              </div>
              <div>
                <label style={label}>Name (optional)</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} style={input} />
              </div>
            </div>
            <button type="submit" style={btn}>Add Subscriber</button>
            {addResult && <span style={{ marginLeft: '16px', fontSize: '13px', color: addResult.includes('success') ? '#7dcea0' : '#e74c3c' }}>{addResult}</span>}
          </form>
        </div>

        {/* Subscriber list */}
        <h2 style={{ fontSize: '16px', color: '#ffffff', margin: '40px 0 16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Subscribers ({subscribers.length})
        </h2>

        {loading ? (
          <p style={{ color: '#666' }}>Loading...</p>
        ) : subscribers.length === 0 ? (
          <p style={{ color: '#666' }}>No subscribers yet.</p>
        ) : (
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  {['Name', 'Email', 'Added', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscribers.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #1a1a1c' }}>
                    <td style={{ padding: '12px 16px', color: '#d4d0c8' }}>{sub.name || '-'}</td>
                    <td style={{ padding: '12px 16px', color: '#9bc4b8' }}>{sub.email}</td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>
                      {new Date(sub.subscribed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: sub.unsubscribed ? '#2a1a1a' : '#1a2a1e',
                        color: sub.unsubscribed ? '#c0392b' : '#7dcea0'
                      }}>
                        {sub.unsubscribed ? 'Unsubscribed' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {!sub.unsubscribed && (
                        <button
                          onClick={() => handleUnsubscribe(sub.email)}
                          style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
