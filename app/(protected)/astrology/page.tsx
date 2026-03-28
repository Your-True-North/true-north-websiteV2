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
  sun:      { title: 'Sun',       meaning: 'Your core identity — who you are at your most essential. The self you\'re becoming.' },
  moon:     { title: 'Moon',      meaning: 'Your emotional world. What you need to feel safe, held, and at home in yourself.' },
  mercury:  { title: 'Mercury',   meaning: 'How you think, learn, and communicate. The way your mind works.' },
  venus:    { title: 'Venus',     meaning: 'What you love, value, and are drawn toward. How you relate and what you find beautiful.' },
  mars:     { title: 'Mars',      meaning: 'How you take action and assert yourself. Where your drive, anger, and desire live.' },
  jupiter:  { title: 'Jupiter',   meaning: 'Where you expand naturally. Your sense of luck, growth, and what opens up for you.' },
  saturn:   { title: 'Saturn',    meaning: 'Your biggest lessons and where life demands the most from you. Also where mastery lives.' },
  chiron:   { title: 'Chiron',    meaning: 'The Wounded Healer. Your deepest wound — and once you\'ve moved through it, your greatest gift to others.' },
  uranus:   { title: 'Uranus',    meaning: 'Where you need freedom and where you\'ll break patterns no matter the cost.' },
  neptune:  { title: 'Neptune',   meaning: 'Your spiritual depth, your idealism, and where illusion or dissolution can either heal or confuse you.' },
  pluto:    { title: 'Pluto',     meaning: 'Where you transform completely. The part of life where you die and come back different.' },
  northNode:{ title: 'North Node',meaning: 'The direction your soul is growing toward in this life. Not easy — but magnetic.' },
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
  Aries:       'The wound around the right to exist boldly — to want things, to go first, to take up space without apology. Often shows up as aggression masking fear, or holding back to avoid being "too much."',
  Taurus:      'The wound around security and self-worth — a deep sense that you don\'t quite deserve good things or that stability will always be pulled away. Often leads to over-accumulating or feeling worthless despite evidence to the contrary.',
  Gemini:      'The wound around being understood — feeling as though your voice doesn\'t land, that you\'re not believed, or that your mind works differently in a way that others can\'t follow. Sometimes a wound around early learning or being silenced.',
  Cancer:      'The wound around belonging and being nurtured — often rooted in early experiences of home feeling unsafe or love feeling conditional. Can manifest as either fierce over-nurturing of others or difficulty receiving care.',
  Leo:         'The wound around recognition — a deep fear of not being enough, of being overlooked, or that your true self, when shown, will be rejected. Often compensated through performing or withdrawing entirely.',
  Virgo:       'The wound around being good enough — relentless self-criticism, perfectionism, and the sense that something is inherently broken or wrong in you. The inner critic is loud here.',
  Libra:       'The wound around relationships and worth within them — a fear of rejection that leads to over-accommodating, loss of self in partnerships, or avoiding closeness altogether to stay safe.',
  Scorpio:     'The wound around trust and betrayal — often from early experiences of having vulnerability used against you. Closeness feels dangerous. Walls go up fast. The healing is learning that depth is survivable.',
  Sagittarius: 'The wound around meaning and freedom — a fear that life has no purpose, or that your beliefs will be taken from you. Can lead to restlessness, dogmatism, or an inability to commit to anything that might disappoint.',
  Capricorn:   'The wound around achievement and authority — never feeling successful enough, a difficult relationship with father figures or institutions, and a relentless drive that\'s really fear of being seen as a failure.',
  Aquarius:    'The wound around belonging — feeling fundamentally different, alien, like you\'ll never quite fit. Often leads to either radical detachment or desperate conformity. The gift is being the one who shows others a different way.',
  Pisces:      'The wound around boundaries and reality — a sensitivity so deep that the world can feel overwhelming, leading to escapism, dissolution, or a spiritual hunger that can\'t be filled. The gift is profound compassion when the wound is owned.',
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
  Conjunction:  'Merged energy — these two forces act as one, amplifying each other.',
  Opposition:   'Tension between opposites — a push-pull that creates awareness through conflict.',
  Trine:        'Natural flow — these energies support each other easily.',
  Square:       'Friction and challenge — the tension here is the engine for growth.',
  Sextile:      'Opportunity — these energies work well together when you engage them.',
  Quincunx:     'Awkward adjustment — these energies don\'t naturally speak the same language.',
}

function formatDeg(deg: number): string {
  const d = Math.floor(deg)
  const m = Math.floor((deg - d) * 60)
  return `${d}°${m.toString().padStart(2, '0')}'`
}

function planetInterpretation(planet: Planet): string {
  const quality = SIGN_QUALITY[planet.sign] || ''
  const retro = planet.isRetrograde ? ' (retrograde — the energy turns inward)' : ''
  const house = HOUSE_MEANING[planet.house] ? ` In your ${HOUSE_MEANING[planet.house].toLowerCase()} area of life.` : ''
  return `Expressed through ${planet.sign} energy — ${quality}.${retro}${house}`
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
              Honestly — I resisted astrology for years. It felt like something people used to avoid taking responsibility for themselves. I didn't take it seriously.
            </p>
            <p style={{ fontWeight: 300, lineHeight: 1.8, color: '#1a1a1a', marginBottom: '1rem', fontSize: '0.9375rem' }}>
              But when I actually looked at it properly — not horoscopes, but the natal chart — I found something different. It's not about prediction. It's pattern recognition. A map of the energies you were born into. And used honestly, it can reveal things about yourself that might otherwise take years to uncover.
            </p>
            <p style={{ fontWeight: 300, lineHeight: 1.8, color: '#1a1a1a', marginBottom: '1rem', fontSize: '0.9375rem' }}>
              <strong style={{ fontWeight: 600 }}>Chiron</strong> in particular stopped me in my tracks. The "Wounded Healer" — the placement that points at your deepest wound, your core fear, the thing you've been compensating for your whole life. Once I understood mine, so much of my behaviour made sense.
            </p>
            <p style={{ fontWeight: 300, lineHeight: 1.8, color: '#3a3a3a', fontSize: '0.9375rem' }}>
              Working with the planets isn't a belief system. You don't have to believe in astrology the way you'd believe in something else. Think of it as another language for self-understanding. Another lens. If it resonates, use it. If it doesn't, leave it. That's all it is — another way to navigate.
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
                    <div style={{ fontSize: '0.8rem', color: '#9bc4b8' }}>Your Wound & Your Gift · House {chiron.house}</div>
                  </div>
                </div>
                <p style={{ fontWeight: 300, lineHeight: 1.8, color: '#1a1a1a', marginBottom: '1rem', fontSize: '0.9375rem' }}>
                  {CHIRON_WOUND[chiron.sign] || `Your Chiron in ${chiron.sign} points to where your deepest healing work lives.`}
                </p>
                <div style={{ padding: '0.875rem', background: 'rgba(155,196,184,0.08)', borderRadius: '8px', fontSize: '0.875rem', color: '#555', lineHeight: 1.7 }}>
                  The wound isn't a flaw to be fixed — it's the place where, once you've moved through it, you become most capable of helping others with the same pain. That's what "Wounded Healer" means.
                </div>
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
                  Aspects are the relationships between planets — how their energies talk to each other. A tight aspect (small orb) is more powerful. Trines and sextiles flow easily. Squares and oppositions create tension that can become tremendous strength.
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
