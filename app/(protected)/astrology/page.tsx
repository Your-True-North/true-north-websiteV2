'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Planet {
  name: string
  symbol: string
  longitude: number
  sign: string
  signDegree: number
  house: number
  isRetrograde: boolean
  speed: number
  isApproximate?: boolean
}

interface HouseCusp {
  house: number
  longitude: number
  sign: string
  signDegree: number
}

interface Aspect {
  body1: string
  body2: string
  type: string
  symbol: string
  angle: number
  orb: number
  applying: boolean
  nature: 'major' | 'minor'
}

interface NatalChart {
  birthData: {
    date: string
    time: string
    location: string
    lat: number
    lng: number
    timezone: string
  }
  planets: Planet[]
  ascendant: HouseCusp
  midheaven: HouseCusp
  houses: HouseCusp[]
  aspects: Aspect[]
}

// ─── Interpretive content ────────────────────────────────────────────────────

const PLANET_MEANING: Record<string, { title: string; meaning: string }> = {
  sun:      { title: 'Sun',       meaning: 'Your core identity. Who you are at your most essential and the self you are becoming.' },
  moon:     { title: 'Moon',      meaning: 'Your emotional world. What you need to feel safe, held, and at home in yourself.' },
  mercury:  { title: 'Mercury',   meaning: 'How you think, learn, and communicate. The way your mind works.' },
  venus:    { title: 'Venus',     meaning: 'What you love, value, and are drawn toward. How you relate and what you find beautiful.' },
  mars:     { title: 'Mars',      meaning: 'How you take action and assert yourself. Where your drive, anger, and desire live.' },
  jupiter:  { title: 'Jupiter',   meaning: 'Where you expand naturally. Your sense of luck, growth, and what opens up for you.' },
  saturn:   { title: 'Saturn',    meaning: 'Your biggest lessons and where life demands the most from you. Also where mastery lives.' },
  chiron:   { title: 'Chiron',    meaning: 'The Wounded Healer. The area of life where you carry your oldest, deepest wound. Once you stop running from it, it becomes the source of your greatest strength.' },
  uranus:   { title: 'Uranus',    meaning: 'Where you need freedom and where you\'ll break patterns no matter the cost.' },
  neptune:  { title: 'Neptune',   meaning: 'Your spiritual depth, your idealism, and where illusion or dissolution can either heal or confuse you.' },
  pluto:    { title: 'Pluto',     meaning: 'Where you transform completely. The part of life where you die and come back different.' },
  northNode:{ title: 'North Node',meaning: 'The direction your soul is growing toward in this life. It won\'t feel natural. It will feel magnetic.' },
}

const SIGN_QUALITY: Record<string, string> = {
  Aries:       'bold, direct, self-initiating',
  Taurus:      'grounded, sensual, steady',
  Gemini:      'curious, communicative, dual-natured',
  Cancer:      'feeling-led, protective, deeply sensitive',
  Leo:         'expressive, warm, seeking to be seen',
  Virgo:       'precise, service-oriented, self-critical',
  Libra:       'relational, peace-seeking, beauty-oriented',
  Scorpio:     'intense, probing, transformative',
  Sagittarius: 'freedom-seeking, philosophical, direct',
  Capricorn:   'disciplined, ambitious, structure-driven',
  Aquarius:    'unconventional, independent, future-facing',
  Pisces:      'fluid, compassionate, spiritually open',
}

const CHIRON_WOUND: Record<string, string> = {
  Aries:       'Your wound lives in your sense of identity and the right to assert yourself. Early experiences may have taught you that your desire, your anger, or your needs were too much. The result is often a swinging between aggression and total self-erasure. You either push too hard or hold back entirely. The work is learning that taking up space is not a threat to others. When this is healed, you become someone who teaches others to find and use their own power without apology.',
  Taurus:      'Your wound sits in security and self-worth. Not the kind you can earn or buy, but the felt sense that you deserve to be here, to be well, to receive good things. This often comes with a deep distrust that stability will last, which can push you toward over-accumulating or sabotaging what you have before it can be taken. The work is building an inner foundation that does not depend on what is in the bank or who approves of you.',
  Gemini:      'Your wound is around being truly heard and understood. There may be early experiences of your words being dismissed, twisted, or ignored. You may have learned to speak in a way that keeps you safe rather than honest. The result can be anxiety around communication, overexplaining, or going quiet altogether. The work is trusting that your thoughts matter and that the right people will be able to follow where your mind goes.',
  Cancer:      'Your wound is in belonging and nurturance. Home, in the emotional sense, may have felt unsafe, unstable, or conditional growing up. You know how to care for others intensely, but receiving care without suspicion is difficult. The work is learning to feel at home inside yourself rather than searching for it in other people, and understanding that needing nurturing is not weakness.',
  Leo:         'Your wound is around being truly seen. Not just noticed, but genuinely recognised for who you are beneath the performance. Early messages may have made you feel that love was conditional on being impressive or useful. This can swing between overperforming to earn approval and retreating to avoid the risk of rejection. The work is separating your worth from your output and learning that you are worth witnessing simply as you are.',
  Virgo:       'Your wound lives in the belief that you are fundamentally flawed or not good enough. This drives relentless self-improvement, hyper-criticism of both yourself and others, and an inability to rest. Nothing ever feels finished or right. The work is not to lower your standards but to separate your value as a person from the quality of what you produce. Imperfection is not the same as failure.',
  Libra:       'Your wound is in relationship and in your sense of worth within it. There is often a deep fear of rejection or abandonment that leads to chronic people-pleasing, losing yourself in partnerships, or avoiding closeness entirely to stay protected. You may give and give while quietly disappearing. The work is learning what you actually want, what your limits are, and that saying so will not cost you everything.',
  Scorpio:     'Your wound is around trust and what happens when you open up. At some point, being vulnerable was used against you, and that memory runs deep. The result is thick walls, difficulty letting people in, and an intensity that can push others away before they get close enough to hurt you. The work is not to become naive but to learn that intimacy can exist without it ending in betrayal. Depth is survivable.',
  Sagittarius: 'Your wound is in meaning and faith. There is often an underlying fear that life has no real purpose, or that your freedom and beliefs will be stripped from you. This can show up as relentless searching, inability to commit, dogmatism, or a restlessness that no place or philosophy ever fully satisfies. The work is finding meaning that does not depend on certainty, and learning to stay present rather than always reaching for the next horizon.',
  Capricorn:   'Your wound is in achievement and what it means to be enough. There is often a harsh internal authority figure who measures your worth entirely by output, status, or success. No accomplishment ever quite lands. Failure feels existential. This often traces back to a difficult relationship with a father figure or with authority more broadly. The work is learning that your value is not a performance review and that rest is not the same as failure.',
  Aquarius:    'Your wound is in belonging to the group while remaining yourself. There is a felt sense of being fundamentally different, of not quite fitting anywhere, of being too strange or too ahead to be accepted. This can flip between radical detachment and desperately wanting to belong. The work is making peace with being an outsider, understanding that the things that make you odd are also the things that make you necessary.',
  Pisces:      'Your wound is in boundaries and in the permeability of your nervous system. You feel everything, often without knowing where you end and others begin. Early life may have been chaotic, confusing, or spiritually disorienting. Escapism, fantasy, or substances can become a way to manage the overwhelm. The work is learning to be in the world without being consumed by it, and discovering that your sensitivity is a gift when it is grounded rather than flooded.',
}

const HOUSE_MEANING: Record<number, string> = {
  1:  'Identity & how you show up',
  2:  'Money, resources & self-worth',
  3:  'Communication & learning',
  4:  'Home, roots & private self',
  5:  'Creativity, play & romance',
  6:  'Health, work & daily habits',
  7:  'Relationships & partnerships',
  8:  'Transformation & shared depth',
  9:  'Philosophy, travel & meaning',
  10: 'Career, legacy & public life',
  11: 'Community, friendship & vision',
  12: 'The unconscious & inner life',
}

const PLANET_DISPLAY: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus',
  mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus',
  neptune: 'Neptune', pluto: 'Pluto', northNode: 'North Node', chiron: 'Chiron'
}

const ASPECT_MEANING: Record<string, string> = {
  Conjunction:  'Merged energy. These two forces act as one and amplify each other.',
  Opposition:   'Tension between opposites. A push-pull that creates awareness through friction.',
  Trine:        'Natural flow. These energies support each other and work together easily.',
  Square:       'Friction and challenge. The tension here is the engine for growth.',
  Sextile:      'Opportunity. These energies work well together when you actively engage them.',
  Quincunx:     'Awkward adjustment. These energies don\'t naturally speak the same language and require conscious effort.',
}

function formatDeg(deg: number): string {
  const d = Math.floor(deg)
  const m = Math.floor((deg - d) * 60)
  return `${d}°${m.toString().padStart(2, '0')}'`
}

function planetInterpretation(planet: Planet): string {
  const quality = SIGN_QUALITY[planet.sign] || ''
  const retro = planet.isRetrograde ? ' Retrograde, so this energy turns inward rather than outward.' : ''
  const house = HOUSE_MEANING[planet.house] ? ` In your ${HOUSE_MEANING[planet.house].toLowerCase()} area of life.` : ''
  return `Expressed through ${planet.sign} energy: ${quality}.${retro}${house}`
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AstrologyPage() {
  const [form, setForm] = useState({ date: '', time: '', location: '' })
  const [chart, setChart] = useState<NatalChart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'planets' | 'houses' | 'aspects'>('planets')
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setChart(null)
    try {
      const res = await fetch('/api/astrology/natal-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Calculation failed')
      setChart(data)
      setActiveTab('planets')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const card: React.CSSProperties = {
    background: '#ffffff', border: '1px solid #e5e5e5',
    borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem'
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '0.75rem',
    background: '#f5f5f5', border: '1px solid #e5e5e5',
    borderRadius: '8px', color: '#1a1a1a', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box'
  }

  const chiron = chart?.planets.find(p => p.name === 'chiron')
  const bigThree = chart ? [
    chart.planets.find(p => p.name === 'sun'),
    chart.planets.find(p => p.name === 'moon'),
    { ...chart.ascendant, name: 'ascendant', symbol: '↑', isRetrograde: false, speed: 0 }
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#1a1a1a' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        <Link
          href="/members"
          style={{ display: 'inline-flex', alignItems: 'center', color: '#9bc4b8', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '2rem' }}
          onMouseEnter={e => e.currentTarget.style.color = '#7fb069'}
          onMouseLeave={e => e.currentTarget.style.color = '#9bc4b8'}
        >
          ← Back to Dashboard
        </Link>

        {/* ─── Why astrology? ─── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 300, letterSpacing: '-0.02em', color: '#1a1a1a', marginBottom: '1.5rem' }}>
            Your Astrology
          </h1>

          <div style={{ ...card, background: '#ffffff', borderLeft: '3px solid #9bc4b8', borderRadius: '0 12px 12px 0' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#9bc4b8', fontWeight: 600, marginBottom: '1rem' }}>WHY IS THIS IN HERE?</div>
            <p style={{ fontWeight: 300, lineHeight: 1.8, color: '#1a1a1a', marginBottom: '1rem', fontSize: '0.9375rem' }}>
              I was sceptical of astrology for years. It felt like something people used to avoid responsibility. I didn't take it seriously. What changed my mind wasn't belief. It was looking at the natal chart properly and realising it wasn't about prediction at all.
            </p>
            <p style={{ fontWeight: 300, lineHeight: 1.8, color: '#1a1a1a', marginBottom: '1rem', fontSize: '0.9375rem' }}>
              A natal chart is a map of the energies present at the moment you were born. Each planet was in a particular sign and house, and those placements describe patterns in how you operate: how you think, what you fear, where you expand naturally, where you contract, what drives you, and what wounds you carry. None of it is destiny. But it is a remarkably accurate mirror.
            </p>
            <p style={{ fontWeight: 300, lineHeight: 1.8, color: '#1a1a1a', marginBottom: '1rem', fontSize: '0.9375rem' }}>
              The placement I pay most attention to is <strong style={{ fontWeight: 600 }}>Chiron</strong>. Named after the mythological centaur who could heal others but couldn't heal his own wound, Chiron in your chart points directly at the thing you have been compensating for your whole life. Not a weakness. Not a flaw. A wound. And like Chiron himself, the people who have sat with that wound the longest are often the most capable of helping others through the same pain.
            </p>
            <p style={{ fontWeight: 300, lineHeight: 1.8, color: '#3a3a3a', fontSize: '0.9375rem' }}>
              You don't need to believe in astrology. Think of it as another language for self-understanding. If it gives you something useful, use it. If it doesn't land, leave it. Working with the planets is simply another way to navigate.
            </p>
          </div>
        </div>

        {/* ─── Form ─── */}
        <div style={card}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#999', fontWeight: 600, marginBottom: '1.25rem' }}>YOUR BIRTH DETAILS</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.4rem' }}>Date of birth</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={input} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.4rem' }}>Time of birth</label>
                <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required style={input} />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.4rem' }}>Place of birth</label>
              <input type="text" placeholder="e.g. London, UK" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required style={input} />
            </div>
            {error && (
              <div style={{ padding: '0.875rem', background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '8px', marginBottom: '1rem', color: '#c0392b', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.875rem',
                background: loading ? '#e5e5e5' : 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                border: 'none', borderRadius: '8px',
                color: loading ? '#999' : '#1a1a1a',
                fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Calculating your chart...' : 'Generate My Chart'}
            </button>
          </form>
        </div>

        {/* ─── Results ─── */}
        {chart && (
          <>
            {/* Summary line */}
            <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '1.75rem', textAlign: 'center' }}>
              Chart for {chart.birthData.date} · {chart.birthData.time} · {chart.birthData.location}
            </div>

            {/* Big Three */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#999', fontWeight: 600, marginBottom: '0.875rem' }}>YOUR BIG THREE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'Sun Sign', sub: 'Who you are', planet: chart.planets.find(p => p.name === 'sun') },
                  { label: 'Moon Sign', sub: 'How you feel', planet: chart.planets.find(p => p.name === 'moon') },
                  { label: 'Rising Sign', sub: 'How you appear', planet: { sign: chart.ascendant.sign, signDegree: chart.ascendant.signDegree } as any }
                ].map(({ label, sub, planet }) => planet ? (
                  <div key={label} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9bc4b8', marginBottom: '0.5rem' }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.25rem' }}>{planet.sign}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>{sub}</div>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* ─── Chiron highlight ─── */}
            {chiron && (
              <div style={{ ...card, background: 'rgba(155,196,184,0.05)', border: '1px solid rgba(155,196,184,0.3)', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>⚷</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '1rem', color: '#1a1a1a' }}>Chiron in {chiron.sign}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9bc4b8' }}>The Wounded Healer · House {chiron.house}</div>
                  </div>
                </div>
                <div style={{ padding: '0.875rem 1rem', background: '#f8f8f8', border: '1px solid #ececec', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8125rem', color: '#555', lineHeight: 1.75 }}>
                  <strong style={{ color: '#1a1a1a', fontWeight: 500 }}>What is Chiron?</strong> In mythology, Chiron was the wisest of the centaurs and a great healer. He was struck by a poisoned arrow and couldn't die, but also couldn't heal himself. In your chart, Chiron marks the area of life where you carry an old, persistent wound. You may have become highly capable in this area precisely because the pain pushed you to understand it deeply. That is why it becomes a gift. Not despite the wound, but because of it.
                </div>
                <p style={{ fontWeight: 300, lineHeight: 1.8, color: '#1a1a1a', fontSize: '0.9375rem' }}>
                  {CHIRON_WOUND[chiron.sign] || `Your Chiron in ${chiron.sign} points to where your deepest healing work lives.`}
                </p>
              </div>
            )}

            {/* ─── Tabs ─── */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '0' }}>
              {([
                { id: 'planets', label: 'Planets' },
                { id: 'houses', label: 'Houses' },
                { id: 'aspects', label: 'Aspects' }
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'none', border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #9bc4b8' : '2px solid transparent',
                    color: activeTab === tab.id ? '#1a1a1a' : '#999',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    fontSize: '0.9rem', cursor: 'pointer',
                    marginBottom: '-1px', transition: 'all 0.15s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ─── Planets tab ─── */}
            {activeTab === 'planets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {chart.planets.filter(p => p.name !== 'chiron').map(p => {
                  const info = PLANET_MEANING[p.name]
                  const isOpen = expandedPlanet === p.name
                  return (
                    <div
                      key={p.name}
                      onClick={() => setExpandedPlanet(isOpen ? null : p.name)}
                      style={{
                        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px',
                        padding: '1rem 1.25rem', cursor: 'pointer',
                        transition: 'border-color 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#d0d0d0')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e5e5')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <span style={{ fontSize: '1.25rem', opacity: 0.75, minWidth: '1.5rem', textAlign: 'center' }}>{p.symbol}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{info?.title || PLANET_DISPLAY[p.name]}</span>
                              <span style={{ color: '#9bc4b8', fontSize: '0.9375rem' }}>in {p.sign}</span>
                              {p.isRetrograde && <span style={{ fontSize: '0.7rem', color: '#c0392b', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '4px', padding: '0 4px' }}>Rx</span>}
                              <span style={{ fontSize: '0.75rem', color: '#bbb' }}>H{p.house}</span>
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: '#999', marginTop: '0.1rem' }}>{info?.meaning}</div>
                          </div>
                        </div>
                        <span style={{ color: '#ccc', fontSize: '0.875rem', flexShrink: 0, marginLeft: '0.5rem' }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                      {isOpen && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                          <div style={{ fontSize: '0.875rem', color: '#444', lineHeight: 1.75 }}>
                            {planetInterpretation(p)}
                          </div>
                          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#bbb' }}>
                            {formatDeg(p.signDegree)} {p.sign} · House {p.house} · {HOUSE_MEANING[p.house]}
                            {p.isApproximate && ' · position is approximate'}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ─── Houses tab ─── */}
            {activeTab === 'houses' && (
              <div>
                <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  The 12 houses represent the different areas of your life. Each house's sign tells you <em>how</em> that area of life is coloured for you. Any planets in a house bring their energy directly into that domain.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {chart.houses.map(h => {
                    const planets = chart.planets.filter(p => p.house === h.house)
                    const isAngular = [1, 4, 7, 10].includes(h.house)
                    return (
                      <div
                        key={h.house}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          background: isAngular ? 'rgba(155,196,184,0.07)' : '#fff',
                          border: `1px solid ${isAngular ? 'rgba(155,196,184,0.25)' : '#ececec'}`,
                          borderRadius: '8px', flexWrap: 'wrap', gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#bbb', fontWeight: 600, minWidth: '2rem' }}>H{h.house}</span>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#1a1a1a', fontWeight: isAngular ? 500 : 400 }}>{HOUSE_MEANING[h.house]}</div>
                            <div style={{ fontSize: '0.775rem', color: '#9bc4b8' }}>{h.sign}</div>
                          </div>
                        </div>
                        {planets.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {planets.map(p => (
                              <span key={p.name} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#f0f0f0', borderRadius: '4px', color: '#555' }}>
                                {p.symbol} {PLANET_DISPLAY[p.name]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ─── Aspects tab ─── */}
            {activeTab === 'aspects' && (
              <div>
                <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  Aspects are the relationships between planets and how their energies interact. A tight aspect with a small orb is more powerful. Trines and sextiles flow easily. Squares and oppositions create tension that, when worked with, becomes tremendous strength.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {chart.aspects.filter(a => a.nature === 'major').map((a, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#fff', border: '1px solid #ececec', borderRadius: '8px',
                        padding: '0.875rem 1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{PLANET_DISPLAY[a.body1]}</span>
                        <span style={{ fontSize: '1.1rem' }}>{a.symbol}</span>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{PLANET_DISPLAY[a.body2]}</span>
                        <span style={{ fontSize: '0.75rem', color: '#9bc4b8', marginLeft: 'auto' }}>{a.type} · {a.orb}° orb</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#666', lineHeight: 1.6 }}>
                        {ASPECT_MEANING[a.type] || ''}
                      </div>
                    </div>
                  ))}
                  {chart.aspects.filter(a => a.nature === 'minor').length > 0 && (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f8f8f8', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#bbb', marginBottom: '0.5rem' }}>MINOR ASPECTS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {chart.aspects.filter(a => a.nature === 'minor').map((a, i) => (
                          <span key={i} style={{ fontSize: '0.775rem', color: '#888', padding: '0.25rem 0.625rem', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '4px' }}>
                            {PLANET_DISPLAY[a.body1]} {a.symbol} {PLANET_DISPLAY[a.body2]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
