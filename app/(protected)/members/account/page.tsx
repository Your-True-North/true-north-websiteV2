'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Moved from the old Home: the Account panel (email, member since, billing) and
// Profile Settings, with the same handlers and the same API routes.

interface User {
  id: string
  email: string
  name: string
  role: string
  joinDate?: string
  profile_photo?: string
  bio?: string
}

const TEXT = '#ECE6DA'
const TEXT_2 = 'rgba(236,230,218,0.8)'
const SAGE = '#9BC4B8'
const LINE = 'rgba(236,230,218,0.08)'

const card: React.CSSProperties = {
  background: '#1B1E1B',
  border: `1px solid ${LINE}`,
  borderRadius: '16px',
  padding: '20px',
}

const label: React.CSSProperties = { display: 'block', fontSize: '15px', color: SAGE, marginBottom: '8px' }

const input: React.CSSProperties = {
  width: '100%',
  minHeight: '48px',
  padding: '12px 14px',
  background: '#111311',
  border: '1px solid rgba(236,230,218,0.16)',
  borderRadius: '12px',
  color: TEXT,
  fontSize: '16px',
  fontFamily: 'inherit',
  outline: 'none',
}

const mainButton: React.CSSProperties = {
  width: '100%',
  height: '54px',
  background: TEXT,
  color: '#111311',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryButton: React.CSSProperties = {
  width: '100%',
  minHeight: '48px',
  padding: '0 16px',
  background: 'transparent',
  border: '1px solid rgba(236,230,218,0.16)',
  borderRadius: '12px',
  color: TEXT,
  fontSize: '16px',
  cursor: 'pointer',
}

const MESSAGE_MAX = 2000

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', bio: '' })
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [billingLoading, setBillingLoading] = useState(false)
  const [billingError, setBillingError] = useState('')
  const [message, setMessage] = useState('')
  const [messageSending, setMessageSending] = useState(false)
  const [messageStatus, setMessageStatus] = useState<'' | 'sent' | 'failed'>('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      window.location.replace('/auth/login')
      return
    }
    try {
      const parsedUser = JSON.parse(userData)
      if (!parsedUser.email || !parsedUser.id) {
        localStorage.removeItem('user')
        window.location.replace('/auth/login')
        return
      }
      setUser(parsedUser)
      setProfileForm({ name: parsedUser.name, email: parsedUser.email, bio: parsedUser.bio || '' })
      if (parsedUser.profile_photo) setProfilePhoto(parsedUser.profile_photo)
    } catch {
      localStorage.removeItem('user')
      window.location.replace('/auth/login')
    }
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    setSaving(true)

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user?.id,
          name: profileForm.name,
          email: profileForm.email,
          photo: profilePhoto,
          bio: profileForm.bio
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setProfileError(data.error || 'Failed to update profile')
        setSaving(false)
        return
      }

      // Update local storage with all user data from server
      const updatedUser = {
        ...(user as User),
        name: data.user.name,
        email: data.user.email,
        profile_photo: data.user.profile_photo,
        bio: data.user.bio,
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setProfileSuccess('Saved.')
      setSaving(false)
    } catch (err) {
      console.error('[Profile Update] Error:', err)
      setProfileError('Something went wrong. Try again.')
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileError('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image must be less than 5MB')
      return
    }

    try {
      const imageCompression = (await import('browser-image-compression')).default
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 500,
        useWebWorker: true,
        fileType: 'image/jpeg'
      })
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string)
        setProfileError('')
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error compressing image:', error)
      setProfileError('Failed to process image. Please try another.')
    }
  }

  // Manage billing and Cancel membership both open the Stripe billing portal
  const handleManageBilling = async () => {
    setBillingLoading(true)
    setBillingError('')
    try {
      const token = document.cookie.match(/auth_token=([^;]+)/)?.[1]
      const res = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setBillingError(data.error || 'Could not open billing portal. Please contact support.')
      }
    } catch {
      setBillingError('Something went wrong. Please try again.')
    } finally {
      setBillingLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || messageSending) return
    setMessageSending(true)
    setMessageStatus('')
    try {
      const res = await fetch('/api/message-true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error('send failed')
      setMessage('')
      setMessageStatus('sent')
    } catch {
      setMessageStatus('failed')
    } finally {
      setMessageSending(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.setItem('justLoggedOut', 'true')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/')
  }

  if (!user) return null

  const row: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
    padding: '12px 0', borderBottom: `1px solid ${LINE}`, fontSize: '16px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px', color: TEXT }}>
      <h1 style={{ fontSize: '30px', margin: '8px 0 0', color: TEXT }}>Account</h1>

      {/* Membership */}
      <section style={card}>
        <div style={row}>
          <span style={{ color: TEXT_2 }}>Email</span>
          <span style={{ wordBreak: 'break-all' }}>{user.email}</span>
        </div>
        <div style={{ ...row, borderBottom: 'none' }}>
          <span style={{ color: TEXT_2 }}>Member since</span>
          <span>
            {user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <button onClick={handleManageBilling} disabled={billingLoading} style={{ ...secondaryButton, opacity: billingLoading ? 0.6 : 1 }}>
            {billingLoading ? 'Opening...' : 'Manage billing'}
          </button>
          <button onClick={handleManageBilling} disabled={billingLoading} style={{ ...secondaryButton, color: TEXT_2, opacity: billingLoading ? 0.6 : 1 }}>
            Cancel membership
          </button>
        </div>
        {billingError && <p style={{ fontSize: '15px', color: TEXT, margin: '12px 0 0' }}>{billingError}</p>}
      </section>

      {/* Message True */}
      <section style={card}>
        <h2 style={{ fontSize: '22px', margin: '0 0 12px', color: TEXT }}>Message True</h2>
        <form onSubmit={handleSendMessage}>
          <label htmlFor="message-true" style={label}>What&apos;s on your mind?</label>
          <textarea
            id="message-true"
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (messageStatus === 'sent') setMessageStatus('') }}
            maxLength={MESSAGE_MAX}
            rows={5}
            disabled={messageSending}
            style={{ ...input, resize: 'vertical', lineHeight: 1.5 }}
          />
          <div style={{ textAlign: 'right', fontSize: '15px', color: TEXT_2, margin: '4px 0 12px' }}>
            {message.length}/{MESSAGE_MAX}
          </div>
          <button
            type="submit"
            disabled={messageSending || !message.trim()}
            style={{ ...secondaryButton, opacity: messageSending || !message.trim() ? 0.6 : 1 }}
          >
            {messageSending ? 'Sending...' : 'Send'}
          </button>
          <p style={{ fontSize: '15px', color: TEXT_2, margin: '12px 0 0', lineHeight: 1.5 }}>
            This goes straight to me. I&apos;ll reply to your email.
          </p>
          {messageStatus === 'sent' && (
            <p style={{ fontSize: '15px', color: SAGE, margin: '12px 0 0' }}>Sent. I&apos;ll reply to your email.</p>
          )}
          {messageStatus === 'failed' && (
            <p style={{ fontSize: '15px', color: TEXT, margin: '12px 0 0' }}>That didn&apos;t send. Try again in a minute.</p>
          )}
        </form>
      </section>

      {/* Profile Settings */}
      <section style={card}>
        <h2 style={{ fontSize: '22px', margin: '0 0 16px', color: TEXT }}>Profile</h2>
        <form onSubmit={handleProfileUpdate}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
              background: profilePhoto ? `url(${profilePhoto})` : '#2A2E2A',
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: `1px solid ${LINE}`,
            }} />
            <label style={{ ...secondaryButton, width: 'auto', display: 'inline-flex', alignItems: 'center' }}>
              Upload photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="profile-name" style={label}>Name</label>
            <input id="profile-name" type="text" value={profileForm.name} required disabled={saving}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} style={input} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="profile-email" style={label}>Email</label>
            <input id="profile-email" type="email" value={profileForm.email} required disabled={saving}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} style={input} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="profile-bio" style={label}>Bio (optional)</label>
            <textarea id="profile-bio" value={profileForm.bio} maxLength={500} rows={3} disabled={saving}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          {profileError && <p style={{ fontSize: '15px', color: TEXT, margin: '0 0 12px' }}>{profileError}</p>}
          {profileSuccess && <p style={{ fontSize: '15px', color: SAGE, margin: '0 0 12px' }}>{profileSuccess}</p>}

          <button type="submit" disabled={saving} style={{ ...mainButton, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>

      <button onClick={handleLogout} style={{ ...secondaryButton, color: TEXT_2 }}>Sign out</button>
    </div>
  )
}
