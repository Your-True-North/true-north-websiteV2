'use client'

import { useEffect, useState } from 'react'

const ACCENT = '#9bc4b8'
const ACCENT_HOVER = '#7da89c'
const TEXT = '#0a0a0a'
const MUTED = '#666666'
const BODY_FONT = '-apple-system, BlinkMacSystemFont, sans-serif'

const UPSELL_STRIPE_URL = 'https://buy.stripe.com/PLACEHOLDER'
const MAIN_STRIPE_URL = 'https://buy.stripe.com/28E8wQaH55Ehes807d9IQ0j'

interface PatternAuditPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function PatternAuditPopup({ isOpen, onClose }: PatternAuditPopupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => setVisible(true), 10)
    } else {
      setVisible(false)
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,10,10,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff', borderRadius: '8px',
          maxWidth: '540px', width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          position: 'relative',
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'transform 0.3s ease',
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '24px', lineHeight: 1, padding: '4px', fontFamily: BODY_FONT }}>×</button>

        <div style={{ height: '3px', background: ACCENT, borderRadius: '8px 8px 0 0' }} />

        <div style={{ padding: '36px 40px 32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: ACCENT, marginBottom: '16px', fontFamily: BODY_FONT }}>One-Time Offer · Before You Go</p>

          <h2 style={{ fontSize: '26px', fontWeight: 500, lineHeight: 1.2, color: TEXT, marginBottom: '6px', fontFamily: "'Gambarino', serif" }}>The Pattern Audit</h2>

          <p style={{ fontSize: '14px', color: MUTED, marginBottom: '24px', fontFamily: BODY_FONT }}>Guided video + structured workbook · £37 one time</p>

          <div style={{ height: '1px', background: '#efefef', marginBottom: '22px' }} />

          <div style={{ fontSize: '15px', lineHeight: 1.8, color: TEXT, fontFamily: BODY_FONT }}>
            <p style={{ marginBottom: '14px' }}>Before our first session, you will receive access to the Pattern Audit.</p>
            <p style={{ marginBottom: '14px' }}>Most men believe they already know what their patterns are. They can name the surface issue. But if that were the full story, they would already have changed it.</p>
            <p style={{ marginBottom: '14px' }}>The reality is that most patterns have another layer underneath - a blind spot that keeps the same reactions, decisions, and outcomes repeating.</p>
            <p style={{ marginBottom: '22px', fontWeight: 600 }}>The Pattern Audit is designed to help you uncover that layer - so that when we meet for the first session, we start with precision. Not guesswork.</p>
          </div>

          <div style={{ borderRadius: '6px', border: '1px solid #e0e0e0', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ background: '#3a3a3a', padding: '12px 20px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#ffffff', margin: 0, fontFamily: BODY_FONT }}>What's included</p>
            </div>
            <div style={{ padding: '16px 20px', background: '#fafafa' }}>
              {[
                'Guided video with True - walking you through the audit process',
                'Structured workbook - focused questions and reflections',
                'Clarity on what is actually running underneath your decisions',
                'A clear starting point for your first Circle session',
              ].map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: i < arr.length - 1 ? '12px' : 0, marginBottom: i < arr.length - 1 ? '12px' : 0, borderBottom: i < arr.length - 1 ? '1px solid #ececec' : 'none', alignItems: 'flex-start' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', fontSize: '10px', color: TEXT, fontWeight: 700 }}>✓</span>
                  <p style={{ fontSize: '14px', color: TEXT, lineHeight: 1.6, margin: 0, fontFamily: BODY_FONT }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <a href={UPSELL_STRIPE_URL} style={{ display: 'block', width: '100%', padding: '15px', background: ACCENT, color: TEXT, fontSize: '15px', fontWeight: 600, borderRadius: '6px', textDecoration: 'none', textAlign: 'center', fontFamily: BODY_FONT, boxSizing: 'border-box' }} onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)} onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}>Yes - Add the Pattern Audit · £37</a>

          <a href={MAIN_STRIPE_URL} style={{ display: 'block', textAlign: 'center', marginTop: '14px', fontSize: '13px', color: MUTED, textDecoration: 'none', fontFamily: BODY_FONT }} onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)} onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}>No thanks - just the membership</a>
        </div>
      </div>
    </div>
  )
}
