'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  heroBg:      '#13140f',
  heroText:    '#f0ebe0',
  sage:        '#8aaa96',
  sageMid:     '#6b9079',
  sageLight:   '#d4e4da',
  cream:       '#f7f3ec',
  stone:       '#eae4d8',
  charcoal:    '#2c2c28',
  inkDark:     '#1a1a16',
  bodyText:    '#3a3a34',
  muted:       '#7a7a6e',
  border:      '#ddd7cc',
  darkBg:      '#1c1c18',
  darkText:    '#e8e2d6',
  darkMuted:   '#9a9a8c',
  fieldBg:     '#232320',
  fieldBorder: '#3a3a34',
  fieldText:   '#e8e2d6',
}

// ─── Typography helpers ───────────────────────────────────────────────────────
const serif = '"Gambarino", Georgia, serif'
const sans  = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'

// ─── Scroll‑fade hook ────────────────────────────────────────────────────────
function useFadeIn(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, vis]
}

// ─── Animated section wrapper ────────────────────────────────────────────────
function FadeSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [ref, vis] = useFadeIn()
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(28px)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider({ color = C.border }: { color?: string }) {
  return <div style={{ width: '48px', height: '1px', background: color, margin: '0 auto' }} />
}

// ─── Label chip ──────────────────────────────────────────────────────────────
function Label({ children, light }: { children: string; light?: boolean }) {
  return (
    <p style={{
      fontFamily: sans,
      fontSize: '11px',
      letterSpacing: '3.5px',
      textTransform: 'uppercase',
      color: light ? C.sage : C.sageMid,
      marginBottom: '20px',
    }}>
      {children}
    </p>
  )
}

// ─── Mushroom botanical background art ───────────────────────────────────────
function MushroomBg({ opacity = 0.09, stroke = '#8aaa96' }: { opacity?: number; stroke?: string }) {
  // Each mushroom: cap-base center at (cx, cy), drawn in local coords then translated.
  // Local coords: y-up = negative y. Cap base at origin. Stem goes down (+y).
  // All paths use fill=none, stroke only, strokeWidth=1 for thin-line look.
  const S = ({ cx, cy, sc = 1, rot = 0 }: { cx: number; cy: number; sc?: number; rot?: number }) => (
    <g
      transform={`translate(${cx},${cy}) rotate(${rot}) scale(${sc})`}
      fill="none"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Cap — bell/dome, slightly asymmetric */}
      <path
        d="M 0,0 C -8,-2 -26,-10 -28,-24 C -30,-38 -20,-50 0,-50 C 20,-50 30,-38 28,-24 C 26,-10 8,-2 0,0 Z"
        strokeWidth="1"
      />
      {/* Gill lines radiating from cap base */}
      <line x1="0" y1="0" x2="-24" y2="-8"  strokeWidth="0.5" />
      <line x1="0" y1="0" x2="-18" y2="-3"  strokeWidth="0.5" />
      <line x1="0" y1="0" x2="-10" y2="-1"  strokeWidth="0.5" />
      <line x1="0" y1="0" x2=" 10" y2="-1"  strokeWidth="0.5" />
      <line x1="0" y1="0" x2=" 18" y2="-3"  strokeWidth="0.5" />
      <line x1="0" y1="0" x2=" 24" y2="-8"  strokeWidth="0.5" />
      {/* Stem — gently tapered and slightly sinuous */}
      <path d="M 0,0 C -2,14 2,28 0,46 C -2,58 1,66 0,76" strokeWidth="1" />
      {/* Annulus (skirt) roughly 60% down the stem */}
      <path d="M -11,42 Q 0,46 11,42" strokeWidth="0.8" />
    </g>
  )

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity, pointerEvents: 'none', zIndex: 0,
      }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Bottom-left cluster */}
      <S cx={80}  cy={870} sc={3.2}  rot={-12} />
      <S cx={190} cy={895} sc={2.1}  rot={6}   />
      <S cx={30}  cy={895} sc={2.5}  rot={-22} />
      {/* Lone tall one, left edge */}
      <S cx={148} cy={840} sc={1.4}  rot={4}   />
      {/* Top-right cluster */}
      <S cx={1360} cy={220} sc={2.8}  rot={10}  />
      <S cx={1410} cy={260} sc={1.6}  rot={-5}  />
      {/* Right-edge mid */}
      <S cx={1430} cy={560} sc={2.0}  rot={8}   />
      {/* Bottom-centre-right */}
      <S cx={820}  cy={890} sc={1.8}  rot={3}   />
    </svg>
  )
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '20px 0',
        cursor: 'pointer',
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <p style={{ fontFamily: serif, fontSize: '17px', color: C.charcoal, lineHeight: 1.4, flex: 1 }}>{q}</p>
        <span style={{ fontFamily: sans, fontSize: '20px', color: C.muted, lineHeight: 1, flexShrink: 0, marginTop: '2px', transition: 'transform 0.25s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </div>
      {open && (
        <p style={{ fontFamily: sans, fontSize: '15px', lineHeight: 1.8, color: C.bodyText, marginTop: '12px' }}>{a}</p>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RetreatPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [formState, setFormState] = useState({
    name: '', email: '', phone: '', experience: '', calling: '', deposit: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const hide = () => {
      document
        .querySelectorAll('nav, header, footer, [role="navigation"], [role="contentinfo"], [class*="footer"], [class*="Footer"]')
        .forEach(el => ((el as HTMLElement).style.display = 'none'))
    }
    hide()
    setTimeout(hide, 150)
  }, [])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(s => ({ ...s, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!formState.name || !formState.email) {
      setError('Please fill in your name and email address.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/retreat-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const vp = isMobile ? '72px 24px' : '100px 48px'
  const maxW = '720px'

  // ── Shared section shell ──
  const section = (bg: string, extra?: React.CSSProperties): React.CSSProperties => ({
    background: bg,
    padding: isMobile ? '72px 24px' : '100px 48px',
    ...extra,
  })

  const inner: React.CSSProperties = {
    maxWidth: maxW,
    margin: '0 auto',
    textAlign: 'center',
  }

  const innerLeft: React.CSSProperties = {
    maxWidth: maxW,
    margin: '0 auto',
    textAlign: 'left',
  }

  return (
    <div style={{ background: C.heroBg, fontFamily: sans, WebkitFontSmoothing: 'antialiased' }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: isMobile ? '80px 24px 60px' : '100px 48px 80px',
          background: `linear-gradient(160deg, #13140f 0%, #1a1f18 55%, #0f1210 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* subtle texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)`,
          pointerEvents: 'none',
        }} />
        {/* sage glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138,170,150,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* mushroom botanical art */}
        <MushroomBg opacity={0.09} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px' }}>
          <p style={{
            fontFamily: sans, fontSize: '11px', letterSpacing: '4px',
            textTransform: 'uppercase', color: C.sage, marginBottom: '36px',
          }}>
            True North · UK Countryside · June 2026
          </p>

          <h1 style={{
            fontFamily: serif, fontSize: isMobile ? '38px' : '58px',
            fontWeight: 400, lineHeight: 1.18, color: C.heroText,
            marginBottom: '28px', letterSpacing: '-0.5px',
          }}>
            A Weekend To Reset<br />What Life Has Buried
          </h1>

          <p style={{
            fontFamily: sans, fontSize: isMobile ? '16px' : '18px',
            lineHeight: 1.75, color: 'rgba(240,235,224,0.72)',
            marginBottom: '48px', maxWidth: '560px', margin: '0 auto 48px',
          }}>
            A small group psilocybin retreat designed for deep clarity, emotional release, nervous system regulation, and genuine reconnection with yourself.
          </p>

          <button
            onClick={scrollToForm}
            style={{
              fontFamily: sans, fontSize: '13px', letterSpacing: '2.5px',
              textTransform: 'uppercase', color: C.heroBg,
              background: C.sage, border: 'none', cursor: 'pointer',
              padding: '17px 40px', borderRadius: '2px',
              transition: 'background 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = C.sageMid)}
            onMouseLeave={e => (e.currentTarget.style.background = C.sage)}
          >
            Register My Interest
          </button>

          <p style={{
            fontFamily: sans, fontSize: '13px', color: 'rgba(240,235,224,0.38)',
            marginTop: '20px',
          }}>
            No payment required · Free to express interest
          </p>
        </div>

        {/* scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          opacity: 0.35,
        }}>
          <div style={{ width: '1px', height: '40px', background: C.sage, animation: 'pulse 2s infinite' }} />
        </div>
      </section>

      {/* ── OPENING / FOUNDER MESSAGE ────────────────────────────────── */}
      <section style={section(C.cream)}>
        <FadeSection style={inner}>
          <Label>A Message From The Facilitator</Label>
          <Divider />
          <div style={{ marginTop: '40px', textAlign: 'left', maxWidth: maxW, margin: '40px auto 0' }}>
            <p style={{
              fontFamily: serif, fontSize: isMobile ? '26px' : '32px',
              color: C.charcoal, lineHeight: 1.45, marginBottom: '32px',
              borderLeft: `3px solid ${C.sage}`, paddingLeft: '24px',
            }}>
              "In a decade of this work, the most powerful events I've ever facilitated have always been the impromptu ones. They come from a deeper calling. That's what this is."
            </p>

            <p style={{ fontFamily: sans, fontSize: '16px', lineHeight: 1.85, color: C.bodyText, marginBottom: '20px' }}>
              I'm not going to dress this up with flowery language or a polished sales pitch. If you're here, something in you already knows why.
            </p>
            <p style={{ fontFamily: sans, fontSize: '16px', lineHeight: 1.85, color: C.bodyText, marginBottom: '20px' }}>
              Over the past decade, I've held space for hundreds of men and women going through genuinely hard things — grief, burnout, identity loss, the quiet ache of feeling disconnected from your own life. The sessions that moved people most were never the big, produced ones. They were the intimate ones. The small rooms. The honest conversations. The work that happened when the environment itself felt safe enough for something real to happen.
            </p>
            <p style={{ fontFamily: sans, fontSize: '16px', lineHeight: 1.85, color: C.bodyText, marginBottom: '20px' }}>
              This retreat came from exactly that impulse. Not a product. Not a programme. A genuine response to what I'm seeing in the people around me right now — people who are carrying something heavy and know it's time to put it down, or who feel ready for the next version of themselves but can't quite see clearly enough to move forward.
            </p>
            <p style={{ fontFamily: sans, fontSize: '16px', lineHeight: 1.85, color: C.bodyText, marginBottom: '20px' }}>
              The Psilocybin Weekend Retreat will take place in the UK — Friday morning to Sunday evening. A countryside setting, a small group of around ten people, two ceremonies, and the kind of space that most of us have never actually given ourselves.
            </p>
            <p style={{ fontFamily: sans, fontSize: '16px', lineHeight: 1.85, color: C.bodyText, marginBottom: '32px' }}>
              If you feel a pull toward this — listen to it. That pull is worth paying attention to.
            </p>
            <p style={{ fontFamily: sans, fontSize: '15px', color: C.muted, fontStyle: 'italic' }}>
              — Mason, True North
            </p>
          </div>
        </FadeSection>
      </section>

      {/* ── RETREAT OVERVIEW ─────────────────────────────────────────── */}
      <section style={section(C.stone)}>
        <FadeSection style={inner}>
          <Label>The Retreat</Label>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? '30px' : '42px', color: C.charcoal, fontWeight: 400, lineHeight: 1.25, marginBottom: '16px' }}>
            Friday to Sunday.<br />UK Countryside.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '16px', color: C.muted, lineHeight: 1.7, marginBottom: '56px' }}>
            Three days away from ordinary life. Nowhere to be. Nothing to perform.
          </p>

          {/* Weekend timeline */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '2px', textAlign: 'left', marginBottom: '64px' }}>
            {[
              {
                day: 'Friday',
                title: 'Arrival & Ground',
                items: ['Travel & settle in', 'Introductions & orientation', 'Opening circle', 'Group dinner together', 'Intentions & preparation']
              },
              {
                day: 'Saturday',
                title: 'The First Ceremony',
                items: ['Morning meditation & breathwork', 'Somatic grounding work', 'Daytime ceremony in nature', 'Open sky, open ground', 'Evening integration & rest']
              },
              {
                day: 'Sunday',
                title: 'The Second Ceremony',
                items: ['Morning movement & stillness', 'Second ceremony — indoors', 'Deep integration support', 'Closing circle', 'Departure Sunday evening']
              },
            ].map(({ day, title, items }) => (
              <div key={day} style={{ background: C.cream, padding: '32px 28px' }}>
                <p style={{ fontFamily: sans, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.sage, marginBottom: '8px' }}>{day}</p>
                <p style={{ fontFamily: serif, fontSize: '20px', color: C.charcoal, marginBottom: '20px', fontWeight: 400 }}>{title}</p>
                {items.map(item => (
                  <p key={item} style={{ fontFamily: sans, fontSize: '14px', color: C.bodyText, lineHeight: 1.6, marginBottom: '8px', paddingLeft: '12px', borderLeft: `2px solid ${C.sageLight}` }}>
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* What's included grid */}
          <h3 style={{ fontFamily: serif, fontSize: isMobile ? '22px' : '28px', color: C.charcoal, fontWeight: 400, marginBottom: '36px' }}>
            Everything You Need Is Included
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', textAlign: 'center' }}>
            {[
              { icon: '🏡', label: 'Countryside Accommodation' },
              { icon: '🍽', label: 'All Meals Provided' },
              { icon: '🌿', label: 'Two Guided Ceremonies' },
              { icon: '🧘', label: 'Breathwork & Meditation' },
              { icon: '🌄', label: 'Nature Hike' },
              { icon: '🫀', label: 'Somatic Practices' },
              { icon: '🤝', label: 'Integration Support' },
              { icon: '👥', label: 'Small Group of ~10' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ background: C.cream, padding: '24px 16px', borderRadius: '2px' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
                <p style={{ fontFamily: sans, fontSize: '13px', color: C.bodyText, lineHeight: 1.5 }}>{label}</p>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── WHY THIS EXISTS ──────────────────────────────────────────── */}
      <section style={{ ...section(C.darkBg), textAlign: 'center' }}>
        <FadeSection style={{ maxWidth: maxW, margin: '0 auto' }}>
          <Label light>Why This Retreat Exists</Label>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? '30px' : '44px', color: C.darkText, fontWeight: 400, lineHeight: 1.25, marginBottom: '40px' }}>
            Some things don't get resolved.<br />They get carried.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2px', textAlign: 'left', marginBottom: '48px' }}>
            {[
              {
                heading: "The Weight You've Got Used To",
                body: "Grief, stress, disconnection, a relationship that no longer fits — most people don't collapse under it. They adapt. They keep moving. Until one day they notice they haven't felt like themselves in a very long time.",
              },
              {
                heading: 'The Space Between Versions',
                body: 'You can see who you want to become. You know something needs to change. But the noise of ordinary life makes it nearly impossible to think clearly — let alone feel clearly.',
              },
              {
                heading: "The Clarity You Can't Force",
                body: "Some breakthroughs don't happen from thinking harder. They happen when you finally stop running, step away from your normal environment, and give yourself a space where something deeper can be heard.",
              },
              {
                heading: "The Reconnection You're Ready For",
                body: "Not just with yourself — with what actually matters. With the relationships, the direction, the sense of purpose that's been obscured by the pace and pressure of everyday life.",
              },
            ].map(({ heading, body }) => (
              <div key={heading} style={{ background: '#232320', padding: '32px' }}>
                <p style={{ fontFamily: serif, fontSize: '18px', color: C.sage, marginBottom: '12px', fontWeight: 400 }}>{heading}</p>
                <p style={{ fontFamily: sans, fontSize: '15px', color: C.darkMuted, lineHeight: 1.8 }}>{body}</p>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: serif, fontSize: isMobile ? '18px' : '22px', color: 'rgba(232,226,214,0.65)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "This retreat exists because those things don't resolve themselves.<br />But the right environment, at the right time, can change everything."
          </p>
        </FadeSection>
      </section>

      {/* ── SAFETY & INTENTION ───────────────────────────────────────── */}
      <section style={section(C.cream)}>
        <FadeSection style={inner}>
          <Label>Held With Care</Label>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? '28px' : '40px', color: C.charcoal, fontWeight: 400, lineHeight: 1.3, marginBottom: '16px' }}>
            Safety Isn't An Afterthought.<br />It's The Foundation.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '16px', color: C.muted, lineHeight: 1.7, marginBottom: '52px', maxWidth: '560px', margin: '0 auto 52px' }}>
            Psilocybin used intentionally, in a carefully held space, with proper preparation and integration support, can be one of the most profound experiences of a person's life. We take that seriously.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', textAlign: 'left', marginBottom: '48px' }}>
            {[
              {
                title: 'Experienced Facilitation',
                body: 'A decade of personal development work and ceremony facilitation. This is not a first attempt. You will be in experienced, grounded hands throughout.',
              },
              {
                title: 'Small, Vetted Group',
                body: 'Around ten people maximum. Every participant fills in a thorough application before being accepted. The calibre of the group matters to the quality of the experience for everyone.',
              },
              {
                title: 'Preparation & Integration',
                body: "What happens before and after is as important as the ceremonies themselves. You'll receive guidance on how to prepare, and support for integration in the days following.",
              },
              {
                title: 'Not Recreational',
                body: "This is a structured, intentional environment. The work is real. If you're looking for a party or a novelty experience, this isn't the right fit — and we'll say so directly.",
              },
              {
                title: 'Beginners Welcome',
                body: "No prior experience with psilocybin is required. If this is your first time, you'll be well supported. The preparation process is designed to meet you exactly where you are.",
              },
              {
                title: 'Emotionally Ready',
                body: "We ask that you only apply if you genuinely feel called to this work — not just curious. There's a difference, and you'll know which one is true for you.",
              },
            ].map(({ title, body }) => (
              <div key={title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '3px', flexShrink: 0, background: C.sage, marginTop: '4px', height: '100%', minHeight: '60px' }} />
                <div>
                  <p style={{ fontFamily: serif, fontSize: '17px', color: C.charcoal, marginBottom: '8px', fontWeight: 400 }}>{title}</p>
                  <p style={{ fontFamily: sans, fontSize: '14px', color: C.bodyText, lineHeight: 1.75 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: C.stone, padding: '28px 32px', borderLeft: `3px solid ${C.sage}`, textAlign: 'left', maxWidth: '580px', margin: '0 auto' }}>
            <p style={{ fontFamily: sans, fontSize: '14px', color: C.bodyText, lineHeight: 1.8 }}>
              <strong>Important:</strong> All applicants are required to complete a thorough screening application before being accepted. This is a non-negotiable part of the process — for your safety and the safety of the group.
            </p>
          </div>
        </FadeSection>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section style={{ ...section(C.charcoal), textAlign: 'center' }}>
        <FadeSection style={{ maxWidth: maxW, margin: '0 auto' }}>
          <Label light>Investment</Label>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? '30px' : '44px', color: C.darkText, fontWeight: 400, lineHeight: 1.25, marginBottom: '20px' }}>
            Nothing Is Owed Right Now.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '16px', color: C.darkMuted, lineHeight: 1.75, marginBottom: '48px' }}>
            This page exists purely to gauge genuine interest and understand likely numbers. No one is being asked to pay anything today.
          </p>

          <div style={{ background: C.darkBg, padding: isMobile ? '40px 28px' : '56px 64px', marginBottom: '40px' }}>
            <p style={{ fontFamily: serif, fontSize: isMobile ? '44px' : '64px', color: C.darkText, marginBottom: '4px', lineHeight: 1 }}>£600</p>
            <p style={{ fontFamily: sans, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', color: C.sage, marginBottom: '28px' }}>Total Retreat Cost (estimated)</p>
            <Divider color={C.fieldBorder} />
            <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', textAlign: 'left' }}>
              {[
                { label: 'Full weekend accommodation', included: true },
                { label: 'All food & drink', included: true },
                { label: 'Both psilocybin ceremonies', included: true },
                { label: 'All movement & somatic sessions', included: true },
                { label: 'Integration support', included: true },
                { label: 'Small group (max 10)', included: true },
              ].map(({ label }) => (
                <p key={label} style={{ fontFamily: sans, fontSize: '14px', color: C.darkMuted, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: C.sage, fontSize: '16px' }}>✓</span> {label}
                </p>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', textAlign: 'left', marginBottom: '40px' }}>
            <div style={{ background: '#232320', padding: '28px' }}>
              <p style={{ fontFamily: serif, fontSize: '18px', color: C.sage, marginBottom: '10px' }}>Step 1 — Express Interest</p>
              <p style={{ fontFamily: sans, fontSize: '14px', color: C.darkMuted, lineHeight: 1.75 }}>Complete the short form below. No payment, no commitment. Just letting me know you're genuinely interested.</p>
            </div>
            <div style={{ background: '#232320', padding: '28px' }}>
              <p style={{ fontFamily: serif, fontSize: '18px', color: C.sage, marginBottom: '10px' }}>Step 2 — Secure Your Place</p>
              <p style={{ fontFamily: sans, fontSize: '14px', color: C.darkMuted, lineHeight: 1.75 }}>Once the venue is confirmed (currently finalising between two countryside locations), those who wish to secure a place will be invited to leave a fully <strong style={{ color: C.darkText }}>refundable £300 deposit</strong>.</p>
            </div>
          </div>

          <p style={{ fontFamily: sans, fontSize: '14px', color: C.darkMuted, lineHeight: 1.7 }}>
            The retreat is being planned for the first or second weekend of June 2026. Dates will be confirmed shortly once the venue is locked in.
          </p>
        </FadeSection>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section style={section(C.stone)}>
        <FadeSection style={{ maxWidth: maxW, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Label>Questions</Label>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? '28px' : '38px', color: C.charcoal, fontWeight: 400, lineHeight: 1.3 }}>
              Honest Answers
            </h2>
          </div>

          <FAQ
            q="Do I need experience with psilocybin?"
            a="No. First-timers are genuinely welcome. In fact, some of the most profound experiences happen with beginners who approach the work with open, clear minds. What matters is that you're emotionally ready — not how much you've done before."
          />
          <FAQ
            q="Will accommodation be shared?"
            a="Yes, most likely. This is a countryside cottage setting — shared spaces and communal meals are part of the intimacy of the experience. Specific accommodation details will be confirmed once the venue is finalised."
          />
          <FAQ
            q="Is food included?"
            a="Yes. All meals are included from Friday dinner through to Sunday lunch. We eat well. Good food is part of how we care for the body during this kind of work."
          />
          <FAQ
            q="What if I'm nervous?"
            a="Nervousness is almost always a sign you're on the right track. It's normal, healthy, and something we'll work with openly. Preparation will help significantly, and you'll never be expected to navigate this alone."
          />
          <FAQ
            q="What if I've never done any inner work before?"
            a="That's completely fine. No background in therapy, meditation, or spiritual practice is required. The retreat is designed to meet people at exactly where they are. Openness matters far more than experience."
          />
          <FAQ
            q="Is this a recreational experience?"
            a="No. This is intentional, facilitated inner work. The structure, the preparation, the integration support — all of it is designed for depth, not entertainment. If you're looking for a recreational experience, this isn't the right fit."
          />
          <FAQ
            q="When will the location be confirmed?"
            a="Very soon. We're finalising between two excellent countryside venues — targeting the first or second weekend of June 2026. Everyone who registers interest will be the first to hear."
          />
          <FAQ
            q="Can I reserve a spot right now?"
            a="Not yet — but you can express your interest, which is the important thing at this stage. Once the venue is confirmed, those who've registered will be invited to secure their place with a fully refundable £300 deposit."
          />
          <FAQ
            q="Is the deposit refundable?"
            a="Yes, fully. If for any reason you can no longer attend once you've paid the deposit, it will be returned to you in full. The deposit exists purely to hold your space once numbers are being finalised."
          />
          <FAQ
            q="Why do I need to fill in an application?"
            a="Because this isn't a standard ticketed event. An application form ensures the environment is right for everyone — that each person is approaching this with genuine readiness, and that the group dynamic supports deep work. It's a non-negotiable part of the process."
          />
        </FadeSection>
      </section>

      {/* ── APPLICATION FORM ─────────────────────────────────────────── */}
      <section
        ref={formRef}
        style={{ background: C.darkBg, padding: isMobile ? '80px 24px' : '100px 48px' }}
      >
        <FadeSection style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <Label light>Application</Label>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? '28px' : '42px', color: C.darkText, fontWeight: 400, lineHeight: 1.3, marginBottom: '16px' }}>
              Register Your Interest
            </h2>
            <p style={{ fontFamily: sans, fontSize: '15px', color: C.darkMuted, lineHeight: 1.75 }}>
              This short form is the first step. No payment is required. I'll be in touch once the venue is confirmed.
            </p>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '56px 40px', background: '#232320', borderRadius: '2px' }}>
              <div style={{ width: '48px', height: '1px', background: C.sage, margin: '0 auto 28px' }} />
              <h3 style={{ fontFamily: serif, fontSize: '28px', color: C.darkText, fontWeight: 400, marginBottom: '16px' }}>
                Thank you.
              </h3>
              <p style={{ fontFamily: sans, fontSize: '15px', color: C.darkMuted, lineHeight: 1.8, maxWidth: '420px', margin: '0 auto' }}>
                Your interest has been received. Check your inbox for a confirmation — and I'll be in touch personally once the venue is confirmed.
              </p>
              <div style={{ width: '48px', height: '1px', background: C.sage, margin: '32px auto 0' }} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input name="name" value={formState.name} onChange={handleChange} placeholder="Your name" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input name="email" type="email" value={formState.email} onChange={handleChange} placeholder="your@email.com" required style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <input name="phone" value={formState.phone} onChange={handleChange} placeholder="Optional but helpful" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Experience With Psilocybin</label>
                <select name="experience" value={formState.experience} onChange={handleChange} style={inputStyle}>
                  <option value="">Select one…</option>
                  <option value="none">No experience — this would be my first time</option>
                  <option value="some">Some experience (1–3 times)</option>
                  <option value="regular">Regular experience (multiple times)</option>
                  <option value="ceremonial">Ceremonial or facilitated experience</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>What Is Calling You To This Retreat?</label>
                <textarea
                  name="calling"
                  value={formState.calling}
                  onChange={handleChange}
                  placeholder="Share as much or as little as feels right. There are no right answers here — just what's true for you."
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Once The Venue Is Confirmed, Would You Likely Secure Your Place With A £300 Deposit?</label>
                <select name="deposit" value={formState.deposit} onChange={handleChange} style={inputStyle}>
                  <option value="">Select one…</option>
                  <option value="yes">Yes — I'd likely secure my space</option>
                  <option value="probably">Probably, if the dates work</option>
                  <option value="maybe">Not sure yet — want to hear more first</option>
                  <option value="no">No, just keeping an eye on it for now</option>
                </select>
              </div>

              {error && (
                <p style={{ fontFamily: sans, fontSize: '14px', color: '#e07070', background: 'rgba(224,112,112,0.08)', padding: '12px 16px' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  fontFamily: sans, fontSize: '13px', letterSpacing: '2.5px',
                  textTransform: 'uppercase', color: C.heroBg,
                  background: submitting ? C.sageMid : C.sage,
                  border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                  padding: '18px 40px', borderRadius: '2px', marginTop: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = C.sageMid }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = C.sage }}
              >
                {submitting ? 'Sending…' : 'Submit My Application'}
              </button>

              <p style={{ fontFamily: sans, fontSize: '12px', color: C.darkMuted, lineHeight: 1.6, textAlign: 'center' }}>
                By submitting you're registering interest only. No payment is taken. Your details will never be shared.
              </p>
            </form>
          )}
        </FadeSection>
      </section>

      {/* ── CLOSING ──────────────────────────────────────────────────── */}
      <section
        style={{
          background: `linear-gradient(160deg, #0f1210 0%, #13180f 60%, #0d0e0b 100%)`,
          padding: isMobile ? '96px 24px' : '120px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* sage glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '800px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(138,170,150,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* mushroom botanical art — slightly more visible on closing */}
        <MushroomBg opacity={0.11} stroke="#a8c8b4" />

        <FadeSection style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Divider color={C.sage} />
          <h2 style={{
            fontFamily: serif, fontSize: isMobile ? '28px' : '44px',
            color: C.heroText, fontWeight: 400, lineHeight: 1.3,
            margin: '40px auto',
          }}>
            Sometimes life asks you to pause long enough to actually hear yourself again.
          </h2>
          <Divider color={C.sage} />

          <p style={{
            fontFamily: sans, fontSize: '16px', color: 'rgba(240,235,224,0.6)',
            lineHeight: 1.8, marginTop: '36px', marginBottom: '48px',
          }}>
            If something in you is responding to this — that's worth listening to. The form is short. Nothing is owed. And whatever happens from here, the fact that you're even considering it says something about where you are right now.
          </p>

          <button
            onClick={scrollToForm}
            style={{
              fontFamily: sans, fontSize: '13px', letterSpacing: '2.5px',
              textTransform: 'uppercase', color: C.heroBg,
              background: C.sage, border: 'none', cursor: 'pointer',
              padding: '18px 48px', borderRadius: '2px',
              transition: 'background 0.2s',
              marginBottom: '20px',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = C.sageMid)}
            onMouseLeave={e => (e.currentTarget.style.background = C.sage)}
          >
            Register My Interest
          </button>

          <p style={{ fontFamily: sans, fontSize: '13px', color: 'rgba(240,235,224,0.3)', marginTop: '12px' }}>
            UK · June 2026 · Small Group · £600 · £300 refundable deposit to secure
          </p>

          <p style={{ fontFamily: sans, fontSize: '12px', color: 'rgba(240,235,224,0.2)', marginTop: '48px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            True North · yourtruenorth.me
          </p>
        </FadeSection>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        input::placeholder, textarea::placeholder {
          color: rgba(154,154,140,0.6);
        }
        select option {
          background: #232320;
          color: #e8e2d6;
        }
      `}</style>
    </div>
  )
}

// ─── Shared form field styles ────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#9a9a8c',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#232320',
  border: '1px solid #3a3a34',
  borderRadius: '2px',
  padding: '14px 16px',
  color: '#e8e2d6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
}
