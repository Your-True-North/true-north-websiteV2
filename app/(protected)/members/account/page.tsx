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

// Colours, buttons and inputs come from the tokens and shared classes in
// app/(protected)/layout.tsx
const TEXT = 'var(--kyn-ink)'
const TEXT_2 = 'var(--kyn-ink2)'
const LINE = 'var(--kyn-border)'

const label: React.CSSProperties = { display: 'block', marginBottom: '8px' }

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
    <div className="kyn-stack" style={{ paddingBottom: '24px', color: TEXT }}>
      <h1 className="kyn-title">Account</h1>

      {/* Membership */}
      <section className="kyn-card">
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <button onClick={handleManageBilling} disabled={billingLoading} className="kyn-btn kyn-btn-secondary kyn-btn-block">
            {billingLoading ? 'Opening...' : 'Manage billing'}
          </button>
          <button onClick={handleManageBilling} disabled={billingLoading} className="kyn-btn kyn-btn-secondary kyn-btn-block">
            Cancel membership
          </button>
        </div>
        {billingError && <p style={{ fontSize: '15px', color: TEXT, margin: '16px 0 0' }}>{billingError}</p>}
      </section>

      {/* Message True */}
      <section className="kyn-card">
        <h2 className="kyn-section-title">Message True</h2>
        <form onSubmit={handleSendMessage}>
          <label htmlFor="message-true" className="kyn-label" style={label}>What&apos;s on your mind?</label>
          <textarea
            id="message-true"
            className="kyn-input"
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (messageStatus === 'sent') setMessageStatus('') }}
            maxLength={MESSAGE_MAX}
            rows={5}
            disabled={messageSending}
            style={{ resize: 'vertical', lineHeight: 1.5 }}
          />
          <div className="kyn-secondary" style={{ textAlign: 'right', margin: '8px 0 16px' }}>
            {message.length}/{MESSAGE_MAX}
          </div>
          <button
            type="submit"
            disabled={messageSending || !message.trim()}
            className="kyn-btn kyn-btn-secondary kyn-btn-block"
          >
            {messageSending ? 'Sending...' : 'Send'}
          </button>
          <p className="kyn-secondary" style={{ margin: '16px 0 0', lineHeight: 1.5 }}>
            This goes straight to me. I&apos;ll reply to your email.
          </p>
          {messageStatus === 'sent' && (
            <p className="kyn-label" style={{ margin: '16px 0 0' }}>Sent. I&apos;ll reply to your email.</p>
          )}
          {messageStatus === 'failed' && (
            <p style={{ fontSize: '15px', color: TEXT, margin: '16px 0 0' }}>That didn&apos;t send. Try again in a minute.</p>
          )}
        </form>
      </section>

      {/* Profile Settings */}
      <section className="kyn-card">
        <h2 className="kyn-section-title">Profile</h2>
        <form onSubmit={handleProfileUpdate}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
              background: profilePhoto ? `url(${profilePhoto})` : 'var(--kyn-thumb)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: `1px solid ${LINE}`,
            }} />
            <label className="kyn-btn kyn-btn-secondary">
              Upload photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="profile-name" className="kyn-label" style={label}>Name</label>
            <input id="profile-name" type="text" className="kyn-input" value={profileForm.name} required disabled={saving}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="profile-email" className="kyn-label" style={label}>Email</label>
            <input id="profile-email" type="email" className="kyn-input" value={profileForm.email} required disabled={saving}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="profile-bio" className="kyn-label" style={label}>Bio (optional)</label>
            <textarea id="profile-bio" className="kyn-input" value={profileForm.bio} maxLength={500} rows={3} disabled={saving}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              style={{ resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          {profileError && <p style={{ fontSize: '15px', color: TEXT, margin: '0 0 16px' }}>{profileError}</p>}
          {profileSuccess && <p className="kyn-label" style={{ margin: '0 0 16px' }}>{profileSuccess}</p>}

          <button type="submit" disabled={saving} className="kyn-btn kyn-btn-main kyn-btn-block">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>

      <button onClick={handleLogout} className="kyn-btn kyn-btn-secondary kyn-btn-block">Sign out</button>
    </div>
  )
}
