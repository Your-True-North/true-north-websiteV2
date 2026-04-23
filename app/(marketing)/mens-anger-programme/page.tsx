'use client'
import { useState } from 'react'
import Link from 'next/link'

const BOOK_URL = '/contact'

const BTN = {
  display: 'inline-block' as const,
  background: '#9bc4b8',
  color: '#0a0a0a',
  padding: '1rem 2.5rem',
  borderRadius: '4px',
  fontWeight: 700,
  fontSize: '1.1rem',
  textDecoration: 'none',
  letterSpacing: '0.02em',
  transition: 'background 0.2s ease',
}

function BookBtn({ label = 'Book Your Call' }: { label?: string }) {
  return (
    <Link href={BOOK_URL} style={BTN}>
      {label} →
    </Link>
  )
}

export default function MensAngerProgramme() {
  const [openPillar, setOpenPillar] = useState<number | null>(null)

  return (
    <div style={{ background: '#0a0a0b', color: '#f6f6f6', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── HERO ── */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 1.5rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(155,196,184,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#9bc4b8', marginBottom: '2rem' }}>
            Men's Anger Programme · 12 Weeks · 10 Spots
          </p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontFamily: 'Gambarino, serif', fontWeight: 400, lineHeight: 1.15, marginBottom: '1.75rem', color: '#ffffff' }}>
            You already know your anger is costing you.
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', lineHeight: 1.75, color: 'rgba(246,246,246,0.75)', marginBottom: '1.25rem' }}>
            You just haven't found anything that goes deep enough to change it.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'rgba(246,246,246,0.6)', marginBottom: '2.5rem', maxWidth: '620px', margin: '0 auto 2.5rem' }}>
            The breathing exercises didn't work. The "just walk away" advice didn't work. Telling yourself you'd be calmer this time didn't work. Because none of that touches the thing your anger is actually protecting. This programme does.
          </p>
          <BookBtn />
        </div>
      </section>

      {/* ── RECOGNITION ── */}
      <section style={{ padding: '5rem 1.5rem', background: '#111113' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Gambarino, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, marginBottom: '2.5rem', color: '#ffffff' }}>
            This is what anger looks like when no one's watching.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              "You react to things that shouldn't bother you, and you know it in the moment but you can't stop.",
              "Your partner has stopped telling you when something's wrong because they know how you'll respond.",
              "Your kids go quiet around you when your mood shifts.",
              "You carry guilt after every outburst, but the apology cycle keeps repeating.",
              'You\'ve told yourself "it\'s not that bad" so many times that you\'ve started to believe it.',
              "You feel a constant low level tension that you've accepted as normal.",
            ].map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9bc4b8', flexShrink: 0, marginTop: '0.6rem' }} />
                <p style={{ fontSize: '1.0625rem', lineHeight: 1.7, color: 'rgba(246,246,246,0.8)', margin: 0 }}>{line}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '2.5rem', fontSize: '1rem', lineHeight: 1.8, color: 'rgba(246,246,246,0.6)', fontStyle: 'italic' }}>
            None of this makes you a bad person. But it is shaping your life in ways you can feel but might not want to admit yet.
          </p>
        </div>
      </section>

      {/* ── VIDEO TESTIMONIALS 1 ── */}
      <section style={{ padding: '4rem 1.5rem', background: '#0a0a0b' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9bc4b8', marginBottom: '2rem', textAlign: 'center' }}>What men say</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ background: '#1a1a1c', borderRadius: '6px', aspectRatio: '9/16', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(155,196,184,0.2)' }}>
                <p style={{ color: 'rgba(246,246,246,0.3)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>Video testimonial {n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMME ── */}
      <section style={{ padding: '5rem 1.5rem', background: '#111113' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Gambarino, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, marginBottom: '0.75rem', color: '#ffffff' }}>
            12 weeks to understand, heal, and rebuild.
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'rgba(246,246,246,0.6)', marginBottom: '3rem' }}>
            This is not anger management. This is not coping strategies. This is the deep work that most men never get access to because most programmes don't go here.
          </p>

          {[
            {
              label: 'Pillar 1',
              title: 'Self Exploration',
              weeks: 'Weeks 1 to 4',
              body: "We can't change every situation that triggers you. But we can change how you see it. We start by examining your self perception, because your outer world is a reflection of your inner world. This is where you begin to understand why things impact you the way they do, where the awareness gets sharp enough that you see the pattern before it plays out.",
            },
            {
              label: 'Pillar 2',
              title: 'Self Discovery',
              weeks: 'Weeks 5 to 8',
              body: "Your mind thinks it's dealt with the pain. Your body hasn't. This pillar is about getting out of your head and into the places where the real patterns live. Somatic experiencing, nervous system work, connecting to the parts of yourself that have been running the show from the shadows. This is where the real shifts happen.",
            },
            {
              label: 'Pillar 3',
              title: 'Personal Blueprint',
              weeks: 'Weeks 9 to 12',
              body: "We don't just clear the old. We build the new. Your relationships, your career, your emotional control. We work towards getting you where you actually want to be, in a way that is fully aligned with who you are, your strengths, and your areas for growth.",
            },
          ].map((pillar, i) => (
            <div key={i} style={{ borderTop: '1px solid rgba(155,196,184,0.15)', padding: '1.75rem 0', cursor: 'pointer' }} onClick={() => setOpenPillar(openPillar === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9bc4b8', marginBottom: '0.375rem' }}>{pillar.label} · {pillar.weeks}</p>
                  <h3 style={{ fontFamily: 'Gambarino, serif', fontSize: '1.5rem', fontWeight: 400, color: '#ffffff', margin: 0 }}>{pillar.title}</h3>
                </div>
                <div style={{ fontSize: '1.25rem', color: '#9bc4b8', flexShrink: 0, marginTop: '0.25rem' }}>{openPillar === i ? '−' : '+'}</div>
              </div>
              {openPillar === i && (
                <p style={{ marginTop: '1.25rem', fontSize: '1rem', lineHeight: 1.8, color: 'rgba(246,246,246,0.7)' }}>{pillar.body}</p>
              )}
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(155,196,184,0.15)', paddingTop: '3rem', textAlign: 'center' }}>
            <BookBtn />
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section style={{ padding: '5rem 1.5rem', background: '#0a0a0b' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ fontFamily: 'Gambarino, serif', fontSize: '1.5rem', fontWeight: 400, color: '#9bc4b8', marginBottom: '1.5rem' }}>This is for you if:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                "You're a man who knows his anger is a problem but has never said it out loud.",
                "You've tried to control it on your own and it keeps coming back.",
                "You're tired of the shame cycle. The outburst, the guilt, the promise to be better, the repeat.",
                "You know there's something deeper driving it and you're ready to look at it.",
                "You want to be the man your kids, your partner, and you yourself can genuinely respect.",
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9bc4b8', flexShrink: 0, marginTop: '0.6rem' }} />
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(246,246,246,0.8)', margin: 0 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'Gambarino, serif', fontSize: '1.5rem', fontWeight: 400, color: 'rgba(246,246,246,0.4)', marginBottom: '1.5rem' }}>This is not for you if:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'You\'re looking for a quick fix or a trick to "manage" it.',
                "You're not willing to be honest with yourself.",
                "You think your anger is everyone else's fault.",
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(246,246,246,0.2)', flexShrink: 0, marginTop: '0.6rem' }} />
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(246,246,246,0.45)', margin: 0 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GUIDE ── */}
      <section style={{ padding: '5rem 1.5rem', background: '#111113' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Gambarino, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, marginBottom: '2rem', color: '#ffffff' }}>
            I've been where you are.
          </h2>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9bc4b8', marginBottom: '1.5rem' }}>True North</p>
          {[
            "I'm True. I'm an anger and addiction coach, a certified somatic therapy practitioner trained by Gabor Maté, a breathwork facilitator, ICF transformational coach, and Reiki master.",
            "But none of that matters as much as this: I lived it.",
            "I came from a world where violence was the only language. Drugs, chaos, aggression. My anger used to scare people. It used to scare me. I'd kick off over nothing and the shame afterwards was crushing.",
            "What changed me wasn't learning to calm down. It was learning to meet the pain my anger was guarding. The hurt I'd been carrying since I was young. The grief I didn't know was there.",
            "That's the work I now hold space for. And I've watched it change men's lives, their relationships, their careers, their sense of themselves.",
            "I'm selective about who I work with. Not because I'm exclusive, but because this work requires readiness. The call is where we figure that out together.",
          ].map((para, i) => (
            <p key={i} style={{ fontSize: '1rem', lineHeight: 1.8, color: i === 1 ? '#ffffff' : 'rgba(246,246,246,0.7)', marginBottom: '1.25rem', fontWeight: i === 1 ? 600 : 400 }}>
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ── VIDEO TESTIMONIALS 2 ── */}
      <section style={{ padding: '4rem 1.5rem', background: '#0a0a0b' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[1, 2].map(n => (
              <div key={n} style={{ background: '#1a1a1c', borderRadius: '6px', aspectRatio: '9/16', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(155,196,184,0.2)' }}>
                <p style={{ color: 'rgba(246,246,246,0.3)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>Video testimonial {n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INVESTMENT ── */}
      <section style={{ padding: '5rem 1.5rem', background: '#111113', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Gambarino, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, marginBottom: '2.5rem', color: '#ffffff' }}>
            The details.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', textAlign: 'left', maxWidth: '380px', margin: '0 auto 3rem' }}>
            {[
              ['Duration', '12 weeks of structured, deep work'],
              ['Spots', '10 men only'],
              ['Investment', '£333 per month'],
              ['Methods', 'Somatic therapy, nervous system recalibration, breathwork, and direct coaching'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(155,196,184,0.1)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#9bc4b8', minWidth: '90px', paddingTop: '0.125rem' }}>{label}</span>
                <span style={{ fontSize: '0.9375rem', color: 'rgba(246,246,246,0.75)', lineHeight: 1.6 }}>{value}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '1rem', color: 'rgba(246,246,246,0.6)', marginBottom: '2rem', lineHeight: 1.7 }}>
            The first step is a call. We'll talk. I'll ask you some questions, you'll ask me some. No pressure. We'll both know if it's right.
          </p>
          <BookBtn />
          <p style={{ marginTop: '2.5rem', fontSize: '1.1rem', color: 'rgba(246,246,246,0.5)', fontStyle: 'italic' }}>
            You've carried this long enough.
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'rgba(246,246,246,0.4)' }}>True</p>
        </div>
      </section>

    </div>
  )
}
