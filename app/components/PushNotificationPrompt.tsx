'use client'

import { useEffect, useState } from 'react'

const VAPID_PUBLIC_KEY = 'BPE2tTyWGyPUSHnTW9AKM_Bhh3mN6dYXM0zSolN-FDClIWzJdgbNfL9KCjD8wofPf_bWXxtw7Vpr7XK7U-X3DvI'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationPrompt({ userId }: { userId?: number }) {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported'>('idle')
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'granted') setStatus('subscribed')
    if (Notification.permission === 'denied') setStatus('denied')
    if (localStorage.getItem('push_dismissed')) setDismissed(true)
  }, [])

  const handleEnable = async () => {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, userId }),
      })

      setStatus('subscribed')
    } catch (err) {
      console.error('Push subscription failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('push_dismissed', '1')
    setDismissed(true)
  }

  if (status === 'unsupported' || status === 'subscribed' || dismissed) return null

  return (
    <div style={{
      background: '#1a1a18',
      border: '1px solid #2c2c2a',
      borderRadius: '8px',
      padding: '1rem 1.25rem',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#f0ede8', marginBottom: '2px' }}>
          Stay connected
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#a0a09c' }}>
          {status === 'denied'
            ? 'Notifications blocked — enable them in your browser settings.'
            : 'Get notified when new content and calls are posted.'}
        </div>
      </div>
      {status !== 'denied' && (
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={handleDismiss}
            style={{ padding: '0.5rem 0.875rem', background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#666', fontSize: '0.8125rem', cursor: 'pointer' }}
          >
            Not now
          </button>
          <button
            onClick={handleEnable}
            disabled={loading}
            style={{ padding: '0.5rem 0.875rem', background: '#9bc4b8', border: 'none', borderRadius: '6px', color: '#0f0f0d', fontSize: '0.8125rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Enabling...' : 'Enable'}
          </button>
        </div>
      )}
    </div>
  )
}
