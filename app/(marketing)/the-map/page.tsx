'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const BOOK_URL = 'https://calendly.com/callwithmason/the-map'
const SPOTS_TOTAL = 10
const SPOTS_TAKEN = 7 // update as cohort fills

const C = {
  dark:       '#0c0c0a',
  dark2:      '#111110',
  card:       '#1a1a18',
  border:     '#2c2c2a',
  cream:      '#f5f3ef',
  textDark:   '#f0ede8',
  mutedDark:  '#a0a09c',
  textLight:  '#1c1a18',
  mutedLight: '#5a5a58',
  sage:       '#9bc4b8',
  sageDeep:   '#7da89c',
  borderLight:'rgba(28,26,24,0.08)',
}

const SERIF = "Gambarino, Georgia, serif"
const SANS  = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

function CTA({ label = 'Book Your Discovery Call', dark = false }: { label?: string; dark?: boolean }) {
  return (
    <Link
      href={BOOK_URL}
      style={{
        display: 'inline-block',
        background: `linear-gradient(135deg, ${C.sage}, #7fb069)`,
        color: '#0c0c0a',
        padding: '1.125rem 2.75rem',
        borderRadius: '4px',
        fontWeight: 700,
        fontSize: '1rem',
        fontFamily: SANS,
        textDecoration: 'none',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}
    >
      {label} →
    </Link>
  )
}

function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p style={{
      fontFamily: SANS,
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: C.sage,
      margin: '0 0 1.25rem',
    }}>
      {children}
    </p>
  )
}

function SpotsBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {Array.from({ length: SPOTS_TOTAL }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: i < SPOTS_TAKEN ? C.sage : 'transparent',
              border: `1.5px solid ${i < SPOTS_TAKEN ? C.sage : 'rgba(155,196,184,0.35)'}`,
            }}
          />
        ))}
      </div>
      <span style={{ fontFamily: SANS, fontSize: '0.8rem', color: C.mutedDark }}>
        {SPOTS_TOTAL - SPOTS_TAKEN} of {SPOTS_TOTAL} spots remaining
      </span>
    </div>
  )
}

export default function TheMapPage() {
  const [openPillar, setOpenPillar] = useState<number | null>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const pillars = [
    {
      num: '01',
      label: 'Weeks 1–4',
      title: 'Self Exploration',
      body: "We can't change every situation that triggers you. But we can change how you see it. We start by examining your self-perception — because your outer world is a reflection of your inner world. This is where you begin to understand why things impact you the way they do, where the awareness gets sharp enough that you see the pattern before it plays out.",
    },
    {
      num: '02',
      label: 'Weeks 5–8',
      title: 'Self Discovery',
      body: "Your mind thinks it's dealt with the pain. Your body hasn't. This pillar is about getting out of your head and into the places where the real patterns live. Somatic experiencing, nervous system work, connecting to the parts of yourself that have been running the show from the shadows. This is where the real shifts happen.",
    },
    {
      num: '03',
      label: 'Weeks 9–12',
      title: 'Personal Blueprint',
      body: "We don't just clear the old. We build the new. Your relationships, your career, your emotional control. We work towards getting you where you actually want to be — in a way that is fully aligned with who you are, your strengths, and your areas for growth.",
    },
  ]

  const faqs = [
    {
      q: "I've tried therapy before. How is this different?",
      a: "Traditional therapy helps you understand the story. Somatic work helps you change the pattern in the body where it actually lives. Most men who come to me have done talk therapy. They can explain their anger perfectly. It still happens. This goes deeper.",
    },
    {
      q: "Is this anger management?",
      a: "No. Anger management gives you strategies to suppress or redirect anger. This goes to what the anger is protecting. The wound underneath. When that's worked with directly, the anger loses its intensity naturally — not because you've learned to bottle it better.",
    },
    {
      q: "What does a typical session look like?",
      a: "Sessions are 1:1. We combine direct conversation, somatic practices, breathwork, and parts work depending on where you are in the programme. Every session is structured but responsive to what's actually happening for you that week.",
    },
    {
      q: "£333 a month feels like a lot.",
      a: "One session with a family solicitor costs more. A divorce costs on average £13,000. The further cost to your kids, your relationship, your own mental health — those are harder to quantify. The question isn't whether you can afford this. It's what it costs to keep going as you are.",
    },
    {
      q: "I'm not sure I'm ready.",
      a: "Book the call and say that. Readiness is something we assess together. Most men who aren't ready don't book the call. The fact that you're reading this says something.",
    },
    {
      q: "How do I know this will work for me?",
      a: "You don't — and I won't promise it. What I can say is that the men who do the work see results. The ones who don't aren't wrong people, they're just not ready. The call is where we figure out which is true for you.",
    },
  ]

  return (
    <div style={{ fontFamily: SANS, color: C.textLight, overflowX: 'hidden' }}>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh',
        background: C.dark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '6rem 1.5rem 5rem' : '8rem 1.5rem 6rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '780px', width: '100%' }}>
          <Label>The MAP · 12-Week Programme</Label>
          <SpotsBar />

          <h1 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? '2.75rem' : 'clamp(3rem, 7vw, 5rem)',
            fontWeight: 400,
            lineHeight: 1.1,
            color: C.textDark,
            marginBottom: '1.75rem',
            letterSpacing: '-0.02em',
          }}>
            You already know your anger is costing you.
          </h1>

          <p style={{
            fontSize: isMobile ? '1.0625rem' : '1.2rem',
            lineHeight: 1.8,
            color: C.mutedDark,
            marginBottom: '0.875rem',
            maxWidth: '600px',
            margin: '0 auto 0.875rem',
          }}>
            You just haven't found anything that goes deep enough to change it.
          </p>

          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(160,160,156,0.7)',
            marginBottom: '3rem',
            maxWidth: '560px',
            margin: '0 auto 3rem',
          }}>
            The breathing exercises didn't work. The counting to ten didn't work. Telling yourself you'd be calmer this time didn't work. Because none of it touches what your anger is actually protecting.
          </p>

          <CTA label="Book Your Free Discovery Call" />

          <p style={{
            marginTop: '1.25rem',
            fontSize: '0.8125rem',
            color: 'rgba(160,160,156,0.5)',
            fontFamily: SANS,
          }}>
            No commitment. No pressure. A real conversation.
          </p>
        </div>
      </section>

      {/* ─── PROOF BAR ─── */}
      <section style={{
        background: C.card,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        padding: '2rem 1.5rem',
      }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '1.5rem',
          textAlign: 'center',
        }}>
          {[
            { value: 'Gabor Maté', label: 'Trained by' },
            { value: 'ICF Certified', label: 'Transformational Coach' },
            { value: '12 Weeks', label: 'Structured programme' },
            { value: '10 Men', label: 'Per cohort — no more' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: 600, color: C.sage, marginBottom: '0.25rem', fontFamily: SANS }}>{value}</div>
              <div style={{ fontSize: '0.8125rem', color: C.mutedDark, fontFamily: SANS }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── RECOGNITION / COST ─── */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: C.cream }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <Label>The Cost of Staying the Same</Label>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: C.textLight,
            marginBottom: '2.5rem',
            letterSpacing: '-0.02em',
          }}>
            This is what anger looks like when no one's watching.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.375rem', marginBottom: '2.5rem' }}>
            {[
              "You react to things that shouldn't bother you — and you know it in the moment but you can't stop.",
              "Your partner has stopped telling you when something's wrong because they know how you'll respond.",
              "Your kids go quiet around you when your mood shifts.",
              "You carry guilt after every outburst, but the apology cycle keeps repeating.",
              'You\'ve told yourself "it\'s not that bad" so many times that you\'ve started to believe it.',
              "You feel a constant low-level tension that you've accepted as normal.",
            ].map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(155,196,184,0.12)',
                  border: `1px solid ${C.sage}`,
                  flexShrink: 0,
                  marginTop: '0.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.sage }} />
                </div>
                <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: C.textLight, margin: 0 }}>{line}</p>
              </div>
            ))}
          </div>

          {/* Pull quote */}
          <div style={{
            borderLeft: `3px solid ${C.sage}`,
            paddingLeft: '1.5rem',
            margin: '2.5rem 0',
          }}>
            <p style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              lineHeight: 1.6,
              color: C.textLight,
              margin: 0,
              fontStyle: 'italic',
            }}>
              "None of this makes you a bad person. But it is shaping your life in ways you can feel but might not be ready to admit yet."
            </p>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: C.dark }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <Label>What Changes</Label>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: C.textDark,
            marginBottom: '3rem',
            letterSpacing: '-0.02em',
          }}>
            Men who did the work.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginBottom: '3.5rem',
          }}>
            {[
              { title: 'From Chaos to Clarity', id: '7Y1upKm8bZk' },
              { title: 'Breaking the Cycle', id: 'ubCK70jYQDI' },
              { title: 'Finding My Power', id: 'UfbMIxlCzgM' },
            ].map(v => (
              <div key={v.id} style={{ borderRadius: '6px', overflow: 'hidden', aspectRatio: '9/16', position: 'relative', background: C.card }}>
                <iframe
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <CTA />
          </div>
        </div>
      </section>

      {/* ─── WHY NOTHING ELSE WORKED ─── */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: C.cream }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <Label>The Real Problem</Label>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: C.textLight,
            marginBottom: '2rem',
            letterSpacing: '-0.02em',
          }}>
            If any of it had worked, you wouldn't be here.
          </h2>

          <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.mutedLight, marginBottom: '1.25rem' }}>
            The breathing exercises. The counting to ten. The "just walk away." The apology and the promise that this time will be different.
          </p>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.mutedLight, marginBottom: '1.25rem' }}>
            These aren't bad ideas. They fail because they target the symptom. Your anger isn't the problem. Your anger is protection. It's a layer of armour over something older — something that got lodged in your nervous system long before you had the words for it.
          </p>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.textLight, fontWeight: 500, marginBottom: 0 }}>
            Until you meet what's underneath, nothing changes permanently. That's what this programme does. And it's why most men who join have already tried everything else.
          </p>
        </div>
      </section>

      {/* ─── PROGRAMME ─── */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: C.dark }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <Label>The Programme</Label>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: C.textDark,
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}>
            12 weeks. One man. Real change.
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: C.mutedDark, marginBottom: '3rem' }}>
            This is not anger management. This is not coping strategies. This is the deep work that most men never get access to because most programmes don't go here.
          </p>

          {pillars.map((pillar, i) => (
            <div
              key={i}
              style={{
                borderTop: `1px solid ${C.border}`,
                padding: '1.75rem 0',
                cursor: 'pointer',
              }}
              onClick={() => setOpenPillar(openPillar === i ? null : i)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: SANS,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: C.sage,
                    letterSpacing: '0.1em',
                    marginTop: '0.6rem',
                    flexShrink: 0,
                  }}>
                    {pillar.num}
                  </span>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mutedDark, margin: '0 0 0.375rem' }}>
                      {pillar.label}
                    </p>
                    <h3 style={{
                      fontFamily: SERIF,
                      fontSize: isMobile ? '1.375rem' : '1.625rem',
                      fontWeight: 400,
                      color: C.textDark,
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}>
                      {pillar.title}
                    </h3>
                  </div>
                </div>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.mutedDark,
                  fontSize: '1.1rem',
                  flexShrink: 0,
                  marginTop: '0.375rem',
                  transition: 'border-color 0.15s',
                }}>
                  {openPillar === i ? '−' : '+'}
                </div>
              </div>
              {openPillar === i && (
                <p style={{
                  marginTop: '1.25rem',
                  marginLeft: isMobile ? 0 : '2.5rem',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  color: C.mutedDark,
                  paddingLeft: isMobile ? 0 : '1.5rem',
                  borderLeft: isMobile ? 'none' : `1px solid ${C.border}`,
                }}>
                  {pillar.body}
                </p>
              )}
            </div>
          ))}

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '3rem', textAlign: 'center' }}>
            <CTA />
          </div>
        </div>
      </section>

      {/* ─── ABOUT MASON ─── */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: C.dark2, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <Label>Who Holds the Space</Label>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: C.textDark,
            marginBottom: '2.5rem',
            letterSpacing: '-0.02em',
          }}>
            I've been where you are.
          </h2>

          <div style={{
            display: 'inline-block',
            fontFamily: SANS,
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: C.sage,
            borderBottom: `1px solid ${C.sage}`,
            paddingBottom: '0.25rem',
            marginBottom: '2rem',
          }}>
            True North · Mason
          </div>

          {[
            "I'm True. I'm an anger and addiction coach, a certified somatic therapy practitioner trained by Gabor Maté, a breathwork facilitator, ICF transformational coach, and Reiki master.",
            "But none of that matters as much as this: I lived it.",
            "I came from a world where violence was the only language. Drugs, chaos, aggression. My anger used to scare people. It used to scare me. I'd kick off over nothing and the shame afterwards was crushing.",
            "What changed me wasn't learning to calm down. It was learning to meet the pain my anger was guarding. The hurt I'd been carrying since I was young. The grief I didn't know was there.",
            "That's the work I now hold space for. And I've watched it change men's lives — their relationships, their careers, their sense of themselves.",
            "I'm selective about who I work with. Not because I'm exclusive, but because this work requires readiness. The call is where we figure that out together.",
          ].map((para, i) => (
            <p key={i} style={{
              fontSize: '1rem',
              lineHeight: 1.85,
              color: i === 1 ? C.textDark : C.mutedDark,
              marginBottom: '1.25rem',
              fontWeight: i === 1 ? 600 : 400,
            }}>
              {para}
            </p>
          ))}

          <div style={{ marginTop: '2.5rem' }}>
            <CTA />
          </div>
        </div>
      </section>

      {/* ─── WHO IT'S FOR ─── */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: C.cream }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '3rem' : '5rem',
        }}>
          <div>
            <Label>This is for you if</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {[
                "You're a man who knows his anger is a problem but has never said it out loud.",
                "You've tried to control it on your own and it keeps coming back.",
                "You're tired of the shame cycle — the outburst, the guilt, the promise, the repeat.",
                "You know there's something deeper driving it and you're ready to look at it.",
                "You want to be the man your kids, your partner, and you yourself can genuinely respect.",
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: C.sage, flexShrink: 0, marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="#0c0c0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: C.textLight, margin: 0 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>This is not for you if</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {[
                "You're looking for a quick fix or a trick to manage it.",
                "You're not willing to be honest with yourself.",
                "You think your anger is everyone else's fault.",
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `1.5px solid ${C.mutedLight}`, flexShrink: 0, marginTop: '0.2rem' }} />
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: C.mutedLight, margin: 0 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── INVESTMENT ─── */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: C.dark, textAlign: 'center' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <Label>The Details</Label>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: C.textDark,
            marginBottom: '3rem',
            letterSpacing: '-0.02em',
          }}>
            Everything you need. Nothing you don't.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: '3rem', textAlign: 'left' }}>
            {[
              ['Duration',    '12 weeks of structured, deep work'],
              ['Format',      '1:1 sessions with Mason directly'],
              ['Spots',       '10 men per cohort — strictly limited'],
              ['Investment',  '£333 per month'],
              ['Methods',     'Somatic therapy, nervous system work, breathwork, and direct coaching'],
            ].map(([label, value], i, arr) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  padding: '1.25rem 0',
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{
                  fontFamily: SANS,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.sage,
                  minWidth: '90px',
                  paddingTop: '0.2rem',
                  flexShrink: 0,
                }}>
                  {label}
                </span>
                <span style={{ fontSize: '0.9375rem', color: C.mutedDark, lineHeight: 1.65 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Price anchor */}
          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
            textAlign: 'left',
          }}>
            <p style={{ fontFamily: SANS, fontSize: '0.8125rem', color: C.mutedDark, lineHeight: 1.7, margin: 0 }}>
              One session with a family solicitor costs more than a month of this programme. A divorce costs on average £13,000.
              The cost to your children, your health, and your sense of yourself — harder to put a number on.
              The question is never whether you can afford to do this. It's what it costs to keep going as you are.
            </p>
          </div>

          <SpotsBar />

          <p style={{ fontSize: '1rem', color: C.mutedDark, marginBottom: '2rem', lineHeight: 1.8 }}>
            The first step is a call. We'll talk. I'll ask you some questions, you'll ask me some. No sales pressure. We'll both know if it's right.
          </p>

          <CTA />

          <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: `1px solid ${C.border}` }}>
            <p style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '1.375rem' : '1.625rem',
              color: C.mutedDark,
              fontStyle: 'italic',
              margin: '0 0 0.5rem',
            }}>
              "You've carried this long enough."
            </p>
            <p style={{ fontFamily: SANS, fontSize: '0.875rem', color: 'rgba(160,160,156,0.5)', margin: 0 }}>True</p>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: C.cream }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <Label>Common Questions</Label>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? '2rem' : 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: C.textLight,
            marginBottom: '3rem',
            letterSpacing: '-0.02em',
          }}>
            What men ask before they book.
          </h2>

          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                borderTop: `1px solid ${C.borderLight}`,
                padding: '1.5rem 0',
                cursor: 'pointer',
              }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: C.textLight, margin: 0, lineHeight: 1.5 }}>{faq.q}</p>
                <span style={{ color: C.sage, fontSize: '1.25rem', flexShrink: 0, marginTop: '0.125rem', fontWeight: 300 }}>
                  {openFaq === i ? '−' : '+'}
                </span>
              </div>
              {openFaq === i && (
                <p style={{ marginTop: '1rem', fontSize: '0.9375rem', lineHeight: 1.8, color: C.mutedLight }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.borderLight}` }} />
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{
        padding: isMobile ? '5rem 1.5rem' : '8rem 1.5rem',
        background: C.dark,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <SpotsBar />
          <h2 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? '2.25rem' : 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 400,
            lineHeight: 1.15,
            color: C.textDark,
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
          }}>
            The men in your life need you to do this work.
          </h2>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.mutedDark, marginBottom: '2.75rem' }}>
            Not the version of you that manages it better. The version that has actually dealt with it. Book the call. That's all this is.
          </p>
          <CTA label="Book Your Free Discovery Call" />
          <p style={{ marginTop: '1.25rem', fontSize: '0.8125rem', color: 'rgba(160,160,156,0.4)', fontFamily: SANS }}>
            A real conversation. No pitch. No obligation.
          </p>
        </div>
      </section>

    </div>
  )
}
