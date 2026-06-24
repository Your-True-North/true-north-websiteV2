'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string
  organisation: string
  email: string
  serviceInterest: string
  message: string
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function ContactDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<FormData>({ name: '', organisation: '', email: '', serviceInterest: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact/organisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please email mason@yourtruenorth.me directly.')
      }
    } catch {
      setError('Something went wrong. Please email mason@yourtruenorth.me directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: '15px',
    fontFamily: 'system-ui, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '2px',
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 999, opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '480px',
        background: '#111111',
        zIndex: 1000,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '32px 36px 48px', flex: 1 }}>
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', fontSize: '24px',
              lineHeight: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>

          {/* Header */}
          <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2d6a4f', marginBottom: '12px' }}>Get in touch</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 400, color: '#fff', marginBottom: '12px', lineHeight: 1.3 }}>
            Let's have a conversation
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px', lineHeight: 1.7 }}>
            Tell us about your organisation and what you're looking to achieve. Every enquiry is read personally by Mason.
          </p>

          {/* Contact links */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '36px', paddingBottom: '32px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
            <a href="mailto:mason@yourtruenorth.me" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ color: '#2d6a4f' }}>✉</span> mason@yourtruenorth.me
            </a>
            <a href="https://wa.me/447449052909" target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ color: '#2d6a4f' }}>↗</span> WhatsApp
            </a>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#fff', marginBottom: '12px' }}>Message received</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                Mason will be in touch shortly. In the meantime, feel free to reach out directly via email or WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Organisation</label>
                <input name="organisation" value={form.organisation} onChange={handleChange} placeholder="Your organisation" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Service interest</label>
                <select name="serviceInterest" value={form.serviceInterest} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select a service</option>
                  <option value="Executive Coaching">Executive Coaching</option>
                  <option value="Group Leadership Programme">Group Leadership Programme</option>
                  <option value="Breathwork & Nervous System Workshop">Breathwork &amp; Nervous System Workshop</option>
                  <option value="Bespoke Retreat">Bespoke Retreat</option>
                  <option value="Other / Not sure yet">Other / Not sure yet</option>
                </select>
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={labelStyle}>Message *</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange} required
                  placeholder="Tell us about your team and what you're looking for..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              {error && <p style={{ fontSize: '13px', color: '#e07070', marginBottom: '16px' }}>{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '15px 24px',
                  background: submitting ? 'rgba(45,106,79,0.5)' : '#2d6a4f',
                  color: '#fff', border: 'none', borderRadius: '6px',
                  fontSize: '14px', fontWeight: 500, letterSpacing: '0.04em',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {submitting ? 'Sending…' : 'Send a message'}
              </button>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: '12px' }}>
                Every enquiry is read personally by Mason.
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Image with fallback ───────────────────────────────────────────────────────

function FallbackImage({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  const [errored, setErrored] = useState(false)
  if (errored) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{alt}</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrganisationsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    const onScroll = () => setNavScrolled(window.scrollY > 20)
    onResize()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll)
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('scroll', onScroll) }
  }, [])

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const companies = ['TAKEDA', 'BOEHRINGER INGELHEIM', 'DUNNHUMBY', 'APOLLO INSURANCE', 'EVENTBRITE', 'MARVEL', 'APPLE', 'BERKELEY GROUP', 'WILLMOTT DIXON', 'ORLEBAR BROWN', 'DISCOVER INTERNATIONAL', 'SYNERGY']

  const services = [
    { num: '01', title: 'One-to-One Executive Coaching', body: 'Deep individual work for leaders navigating pressure, transition or growth. Six to twelve month engagements built around what your leader actually needs.' },
    { num: '02', title: 'Group Leadership Programmes', body: 'Cohort-based programmes combining somatic awareness, emotional intelligence and strategic thinking. Designed for leadership teams and high-potential cohorts.' },
    { num: '03', title: 'Breathwork & Nervous System Workshops', body: 'Evidence-based group sessions that create immediate shifts in regulation, presence and team connection. Half-day and full-day formats available.' },
    { num: '04', title: 'Bespoke Retreats', body: 'Full-day and residential experiences designed in collaboration with your organisation. We build the container; you bring the people who need it most.' },
  ]

  const pillars = [
    { title: 'Somatic', body: 'I work with the body, not just the mind. Nervous system regulation is the foundation of sustainable leadership — not a nice-to-have.' },
    { title: 'Systemic', body: 'Individual change ripples outward. I look at the person, the team, and the organisational field together to create lasting impact.' },
    { title: 'Sustained', body: 'I build internal capacity, not dependency. My work is designed to outlast the engagement and compound over time.' },
  ]

  const checklist = [
    'Confidential and fully tailored to your context',
    'Works alongside existing L&D programmes',
    'Evidence-based somatic methodology',
    'Measurable outcomes agreed upfront',
  ]

  // ─── Styles ─────────────────────────────────────────────────────────────────

  const eyebrow: React.CSSProperties = {
    fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2d6a4f',
    marginBottom: '16px', fontFamily: 'system-ui, sans-serif',
  }

  const sectionPad: React.CSSProperties = {
    padding: isMobile ? '72px 24px' : '100px 64px',
    maxWidth: '1280px', margin: '0 auto',
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1c1c1c' }}>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: navScrolled ? 'rgba(255,255,255,0.97)' : '#ffffff',
        borderBottom: `0.5px solid ${navScrolled ? '#e0e0e0' : '#e0e0e0'}`,
        backdropFilter: 'blur(8px)',
        transition: 'background 0.2s',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 400, color: '#0d0d0d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>True North</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '32px' }}>
            {!isMobile && (
              <a href="#contact" onClick={scrollToContact} style={{ fontSize: '13px', color: '#555', textDecoration: 'none', letterSpacing: '0.02em' }}>
                Contact
              </a>
            )}
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                padding: '10px 20px', background: '#2d6a4f', color: '#fff',
                border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', letterSpacing: '0.02em', whiteSpace: 'nowrap',
              }}
            >
              Let's have a conversation
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: '100vh', paddingTop: '64px' }}>
        {/* Left */}
        <div style={{ background: '#fafaf8', display: 'flex', alignItems: 'center', padding: isMobile ? '72px 28px' : '80px 72px' }}>
          <div style={{ maxWidth: '520px' }}>
            <p style={eyebrow}>For Organisations</p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '36px' : '48px', fontWeight: 400, lineHeight: 1.15, color: '#0d0d0d', marginBottom: '24px' }}>
              When your people are well, your organisation performs
            </h1>
            <p style={{ fontSize: '17px', color: '#555', lineHeight: 1.75, marginBottom: '36px' }}>
              True North delivers evidence-based leadership coaching, breathwork, and group programmes to organisations that understand the connection between inner wellbeing and outer performance.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDrawerOpen(true)}
                style={{ padding: '14px 28px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.02em' }}
              >
                Let's have a conversation
              </button>
              <a
                href="#services"
                onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) }}
                style={{ padding: '14px 28px', background: 'transparent', color: '#2d6a4f', border: '1px solid #2d6a4f', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.02em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                View my services
              </a>
            </div>
          </div>
        </div>
        {/* Right */}
        <div style={{ background: '#1c1c1c', minHeight: isMobile ? '360px' : 'auto', position: 'relative', overflow: 'hidden' }}>
          <FallbackImage src="/images/organisations/mason-presenting.jpg" alt="Mason presenting" />
        </div>
      </section>

      {/* ── LOGO STRIP ───────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', borderTop: '0.5px solid #e0e0e0', borderBottom: '0.5px solid #e0e0e0', padding: '56px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: '32px' }}>Trusted by global organisations</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {companies.map(co => (
              <span key={co} style={{
                padding: '8px 16px', background: '#eaf3ee', color: '#2d6a4f',
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
                textTransform: 'uppercase', borderRadius: '4px',
              }}>
                {co}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHALLENGE ────────────────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
        {/* Left */}
        <div style={{ background: '#111111', padding: isMobile ? '72px 28px' : '96px 72px', display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: '480px' }}>
            <p style={{ ...eyebrow, color: 'rgba(45,106,79,0.9)' }}>The challenge</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '30px' : '38px', fontWeight: 400, color: '#fff', lineHeight: 1.25, marginBottom: '24px' }}>
              The performance gap most organisations don't talk about
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              Burnout, disconnection, and reactive leadership are costly — yet most interventions address symptoms rather than root causes. True North works at the level where lasting change actually happens.
            </p>
          </div>
        </div>
        {/* Right */}
        <div style={{ background: '#f5f5f3', padding: isMobile ? '64px 28px' : '96px 72px', display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: '440px' }}>
            <p style={{ ...eyebrow }}>What I see</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                'Leaders who can\'t regulate themselves can\'t lead others effectively',
                'Stress and disconnection are contagious — and so is calm',
                'Sustainable performance requires an embodied, not just intellectual, foundation',
                'The body holds the patterns that hold organisations back',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2d6a4f', flexShrink: 0, marginTop: '7px' }} />
                  <span style={{ fontSize: '15px', color: '#333', lineHeight: 1.7 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section id="services" style={{ background: '#ffffff' }}>
        <div style={sectionPad}>
          <p style={eyebrow}>What I offer</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 400, color: '#0d0d0d', marginBottom: '52px', maxWidth: '520px', lineHeight: 1.3 }}>
            Programmes tailored to what your organisation actually needs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '2px', border: '0.5px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
            {services.map((s, i) => (
              <div key={s.num} style={{
                padding: '40px 36px',
                background: i % 2 === 0 ? '#fafaf8' : '#ffffff',
                borderRight: i % 2 === 0 && !isMobile ? '0.5px solid #e0e0e0' : 'none',
                borderBottom: i < 2 ? '0.5px solid #e0e0e0' : 'none',
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#2d6a4f', letterSpacing: '0.1em', display: 'block', marginBottom: '16px' }}>{s.num}</span>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: '#0d0d0d', marginBottom: '12px', lineHeight: 1.35 }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.75 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPROACH ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#fafaf8', borderTop: '0.5px solid #e0e0e0' }}>
        <div style={{ ...sectionPad, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '56px' : '96px', alignItems: 'start' }}>
          {/* Left — pillars */}
          <div>
            <p style={eyebrow}>My approach</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '34px', fontWeight: 400, color: '#0d0d0d', marginBottom: '44px', lineHeight: 1.3 }}>
              Three principles that guide everything I do
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {pillars.map(p => (
                <div key={p.title} style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '3px', background: '#2d6a4f', borderRadius: '2px', flexShrink: 0, minHeight: '64px' }} />
                  <div>
                    <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: 400, color: '#0d0d0d', marginBottom: '8px' }}>{p.title}</h4>
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.75 }}>{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right — quote + checklist */}
          <div style={{ paddingTop: isMobile ? '0' : '52px' }}>
            <blockquote style={{
              margin: '0 0 40px 0', padding: '28px 32px',
              background: '#111111', borderRadius: '6px',
              borderLeft: '3px solid #2d6a4f',
            }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: '16px' }}>
                "The most impactful leadership development I've experienced in twenty years. It changed how I lead — and how I live."
              </p>
              <cite style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontStyle: 'normal' }}>
                Director, Fortune 500 Company
              </cite>
            </blockquote>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {checklist.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#2d6a4f', fontWeight: 600, fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#444', lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── MASON BIO ─────────────────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
        {/* Left */}
        <div style={{ background: '#2d6a4f', padding: isMobile ? '72px 28px' : '96px 72px', display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: '460px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>Who you'll work with</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '34px', fontWeight: 400, color: '#fff', marginBottom: '8px', lineHeight: 1.25 }}>Mason Roberts</h2>
            <p style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '24px' }}>Founder & Lead Practitioner</p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, marginBottom: '24px' }}>
              Mason is a leadership coach, breathwork facilitator and somatic practitioner with over a decade of experience working with executives, founders and high-performance teams across Europe and the US.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, marginBottom: '32px' }}>
              His work draws on Somatic Experiencing, nervous system science and depth psychology to create the conditions for real, lasting change at both the individual and organisational level.
            </p>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ padding: '13px 26px', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.03em' }}
            >
              Get in touch
            </button>
          </div>
        </div>
        {/* Right */}
        <div style={{ background: '#1a1a1a', minHeight: isMobile ? '360px' : 'auto', position: 'relative', overflow: 'hidden' }}>
          <FallbackImage src="/images/organisations/mason-breathwork.jpg" alt="Mason facilitating breathwork" />
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────────────── */}
      <section id="contact" style={{ background: '#fafaf8', borderTop: '0.5px solid #e0e0e0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '80px 24px' : '120px 32px', textAlign: 'center' }}>
          <p style={eyebrow}>Get in touch</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '32px' : '44px', fontWeight: 400, color: '#0d0d0d', marginBottom: '20px', lineHeight: 1.2 }}>
            Support your people.<br />Strengthen performance.
          </h2>
          <p style={{ fontSize: '16px', color: '#666', lineHeight: 1.75, marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>
            Every enquiry is read personally by Mason. If we're a good fit, we'll schedule a no-commitment conversation about what's possible for your organisation.
          </p>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ padding: '16px 36px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.02em' }}
          >
            Get in touch
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0d0d0d', padding: '48px 32px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '32px', marginBottom: '40px', paddingBottom: '40px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
            {/* Logo */}
            <div>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>True North</span>
            </div>
            {/* Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: isMobile ? 'left' : 'center' }}>
              <a href="mailto:mason@yourtruenorth.me" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>mason@yourtruenorth.me</a>
              <a href="https://wa.me/447449052909" target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>WhatsApp +44 7449 052909</a>
              <a href="https://yourtruenorth.me" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>yourtruenorth.me</a>
            </div>
            {/* Empty col for balance */}
            <div />
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.8, textAlign: 'center' }}>
            © 2025 True North. All rights reserved. True North is a trading name of Mason Roberts. All coaching, breathwork and energy healing services are provided for personal development purposes only and do not constitute medical, psychological or therapeutic treatment. If you are experiencing a mental health crisis please contact a qualified medical professional. Confidentiality is maintained throughout all client relationships.
          </p>
        </div>
      </footer>

      {/* ── DRAWER ───────────────────────────────────────────────────────── */}
      <ContactDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
