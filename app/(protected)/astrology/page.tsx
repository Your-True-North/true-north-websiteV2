'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Planet {
  name: string
  symbol: string
  longitude: number
  latitude: number
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
    utcOffset: number
  }
  planets: Planet[]
  ascendant: HouseCusp
  midheaven: HouseCusp
  houses: HouseCusp[]
  aspects: Aspect[]
}

const PLANET_DISPLAY: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus',
  mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus',
  neptune: 'Neptune', pluto: 'Pluto', northNode: 'North Node', chiron: 'Chiron'
}

const ASPECT_COLORS: Record<string, string> = {
  Conjunction: '#1a1a1a', Opposition: '#c0392b', Trine: '#7fb069',
  Square: '#c0392b', Sextile: '#9bc4b8', Quincunx: '#e67e22',
  Semisextile: '#999', Semisquare: '#e67e22', Sesquisquare: '#e67e22'
}

function formatDegree(deg: number): string {
  const d = Math.floor(deg)
  const m = Math.floor((deg - d) * 60)
  return `${d}°${m.toString().padStart(2, '0')}'`
}

export default function AstrologyPage() {
  const [form, setForm] = useState({ date: '', time: '', location: '' })
  const [chart, setChart] = useState<NatalChart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'planets' | 'houses' | 'aspects'>('planets')

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem',
    background: '#f5f5f5', border: '1px solid #e5e5e5',
    borderRadius: '8px', color: '#1a1a1a', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#1a1a1a', fontSize: '0.875rem',
    marginBottom: '0.5rem', fontWeight: 400
  }

  const cardStyle: React.CSSProperties = {
    background: '#ffffff', border: '1px solid #e5e5e5',
    borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#1a1a1a' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Back link */}
        <Link
          href="/members"
          style={{ display: 'inline-flex', alignItems: 'center', color: '#9bc4b8', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem' }}
          onMouseEnter={e => e.currentTarget.style.color = '#7fb069'}
          onMouseLeave={e => e.currentTarget.style.color = '#9bc4b8'}
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 300, letterSpacing: '-0.02em', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Natal Chart
          </h1>
          <p style={{ color: '#666', fontWeight: 300, fontSize: '1rem' }}>
            Enter your birth details to calculate your natal astrology chart.
          </p>
        </div>

        {/* Form */}
        <div style={cardStyle}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Time of Birth</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => setForm({ ...form, time: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Place of Birth</label>
              <input
                type="text"
                placeholder="e.g. London, UK"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ padding: '0.875rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '8px', marginBottom: '1rem', color: '#c0392b', fontSize: '0.875rem' }}>
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
                color: loading ? '#999' : '#1a1a1a', fontWeight: 600, fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Calculating...' : 'Calculate Chart'}
            </button>
          </form>
        </div>

        {/* Chart Results */}
        {chart && (
          <>
            {/* Birth data summary */}
            <div style={{ ...cardStyle, background: 'rgba(155,196,184,0.06)', border: '1px solid rgba(155,196,184,0.25)' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#9bc4b8', fontWeight: 600, marginBottom: '0.75rem' }}>CHART FOR</div>
              <div style={{ fontWeight: 300, fontSize: '1rem', color: '#1a1a1a', marginBottom: '0.25rem' }}>
                {chart.birthData.date} at {chart.birthData.time} · {chart.birthData.location}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#999' }}>
                {chart.birthData.timezone} · {chart.birthData.lat}°, {chart.birthData.lng}°
              </div>
            </div>

            {/* Ascendant + MC highlight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Ascendant', data: chart.ascendant },
                { label: 'Midheaven', data: chart.midheaven }
              ].map(({ label, data }) => (
                <div key={label} style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#999', marginBottom: '0.5rem' }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#1a1a1a' }}>{data.sign}</div>
                  <div style={{ fontSize: '0.875rem', color: '#9bc4b8' }}>{formatDegree(data.signDegree)}</div>
                </div>
              ))}
            </div>

            {/* Tab navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {(['planets', 'houses', 'aspects'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: activeTab === tab ? 'linear-gradient(135deg, #9bc4b8, #7fb069)' : '#f5f5f5',
                    border: activeTab === tab ? 'none' : '1px solid #e5e5e5',
                    borderRadius: '6px',
                    color: activeTab === tab ? '#1a1a1a' : '#666',
                    fontWeight: activeTab === tab ? 600 : 400,
                    fontSize: '0.875rem', cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Planets tab */}
            {activeTab === 'planets' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#999', marginBottom: '1.25rem' }}>PLANETARY POSITIONS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {/* Header row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 0.8fr 0.8fr', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#f8f8f8', borderRadius: '6px', marginBottom: '0.25rem' }}>
                    {['Planet', 'Sign', 'Degree', 'House', 'R'].map(h => (
                      <div key={h} style={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: '#999', fontWeight: 600 }}>{h}</div>
                    ))}
                  </div>
                  {chart.planets.map(p => (
                    <div
                      key={p.name}
                      style={{
                        display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 0.8fr 0.8fr',
                        gap: '0.5rem', padding: '0.75rem',
                        borderBottom: '1px solid #f0f0f0', alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem', opacity: 0.8 }}>{p.symbol}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>
                          {PLANET_DISPLAY[p.name]}
                        </span>
                        {p.isApproximate && (
                          <span style={{ fontSize: '0.65rem', color: '#bbb', lineHeight: 1 }} title="Approximate position">~</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>{p.sign}</div>
                      <div style={{ fontSize: '0.875rem', color: '#666', fontFamily: 'monospace' }}>{formatDegree(p.signDegree)}</div>
                      <div style={{ fontSize: '0.875rem', color: '#9bc4b8', fontWeight: 600 }}>{p.house}</div>
                      <div style={{ fontSize: '0.8rem', color: p.isRetrograde ? '#c0392b' : 'transparent' }}>Rx</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Houses tab */}
            {activeTab === 'houses' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#999', marginBottom: '1.25rem' }}>HOUSE CUSPS · PLACIDUS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {chart.houses.map(h => (
                    <div
                      key={h.house}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        background: [1, 4, 7, 10].includes(h.house) ? 'rgba(155,196,184,0.08)' : '#f8f8f8',
                        border: `1px solid ${[1, 4, 7, 10].includes(h.house) ? 'rgba(155,196,184,0.2)' : '#ececec'}`,
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 600, minWidth: '1.5rem' }}>H{h.house}</span>
                        <span style={{ fontSize: '0.875rem', color: '#1a1a1a' }}>{h.sign}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#9bc4b8', fontFamily: 'monospace' }}>
                        {formatDegree(h.signDegree)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aspects tab */}
            {activeTab === 'aspects' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#999', marginBottom: '1.25rem' }}>
                  ASPECTS · {chart.aspects.filter(a => a.nature === 'major').length} major, {chart.aspects.filter(a => a.nature === 'minor').length} minor
                </div>
                {chart.aspects.length === 0 ? (
                  <div style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No aspects found</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {chart.aspects.map((a, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid', gridTemplateColumns: '2fr 1.5fr 2fr 1.2fr 1fr',
                          gap: '0.5rem', padding: '0.625rem 0.5rem',
                          borderBottom: '1px solid #f0f0f0', alignItems: 'center',
                          opacity: a.nature === 'minor' ? 0.7 : 1
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', color: '#1a1a1a' }}>{PLANET_DISPLAY[a.body1]}</div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '1rem', color: ASPECT_COLORS[a.type] || '#1a1a1a', display: 'block' }}>{a.symbol}</span>
                          <span style={{ fontSize: '0.65rem', color: ASPECT_COLORS[a.type] || '#999' }}>{a.type}</span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#1a1a1a' }}>{PLANET_DISPLAY[a.body2]}</div>
                        <div style={{ fontSize: '0.75rem', color: '#999', fontFamily: 'monospace' }}>orb {a.orb}°</div>
                        <div style={{ fontSize: '0.7rem', color: a.applying ? '#7fb069' : '#bbb' }}>
                          {a.applying ? '▲ app' : '▽ sep'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Accuracy note */}
            <div style={{ padding: '0.875rem 1rem', background: '#f8f8f8', border: '1px solid #ececec', borderRadius: '8px', fontSize: '0.8rem', color: '#999', lineHeight: 1.6 }}>
              Planetary positions accurate to ±0.01° (Sun), ±0.2° (Moon), ±1-2° (planets). Pluto and Chiron are approximate.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
