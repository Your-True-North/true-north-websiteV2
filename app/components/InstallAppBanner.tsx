'use client'

import { useEffect, useState } from 'react'

export default function InstallAppBanner() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other' | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    if (localStorage.getItem('app_install_dismissed')) {
      setDismissed(true)
      return
    }

    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isAndroid = /android/i.test(ua)

    if (isIOS) setPlatform('ios')
    else if (isAndroid) setPlatform('android')
    else setPlatform('other')

    // Android install prompt
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])

  const handleInstall = async () => {
    if (platform === 'android' && deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setIsInstalled(true)
      setDeferredPrompt(null)
    } else {
      setShowModal(true)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('app_install_dismissed', '1')
    setDismissed(true)
    setShowModal(false)
  }

  if (isInstalled || dismissed || !platform || platform === 'other') return null

  return (
    <>
      {/* Banner */}
      <div style={{
        background: '#1a1a1a',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', background: '#ffffff',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem',
            color: '#1a1a1a', flexShrink: 0, letterSpacing: '0.02em'
          }}>
            CoR
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#ffffff', marginBottom: '2px' }}>
              Add CoR to your home screen
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)' }}>
              Access the members area like an app
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={handleDismiss}
            style={{ padding: '0.5rem 0.875rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', cursor: 'pointer' }}
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            style={{ padding: '0.5rem 1rem', background: '#9bc4b8', border: 'none', borderRadius: '6px', color: '#1a1a1a', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Install
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showModal && platform === 'ios' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 9999, display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', padding: '1rem'
        }} onClick={() => setShowModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff', borderRadius: '16px', padding: '2rem',
              width: '100%', maxWidth: '400px', marginBottom: '1rem'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a1a1a' }}>
              Add to Home Screen
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', background: '#9bc4b8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>1</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Tap the Share button</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>The box with an arrow pointing up. On newer iPhones it's at the <strong>bottom centre</strong> of Safari. On older iOS it's in the <strong>bottom toolbar</strong>.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', background: '#9bc4b8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>2</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Tap "Add to Home Screen"</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>In the share sheet, <strong>scroll down</strong> past AirDrop and the app icons — it's further down the list</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', background: '#9bc4b8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>3</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Tap Add</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>CoR will appear on your home screen</div>
                </div>
              </div>
            </div>

            {/* Share icon visual */}
            <div style={{ background: '#f4f4f4', borderRadius: '10px', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '0.5rem' }}>The Share button looks like this:</div>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>It's in the toolbar at the bottom of Safari.<br/>If you don't see it, scroll down on the share sheet to find "Add to Home Screen".</div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{ width: '100%', padding: '0.875rem', background: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
