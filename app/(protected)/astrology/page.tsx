'use client'

import { useState, useEffect } from 'react'
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
  sun:      { title: 'Sun',        meaning: 'Your core identity and the self you are still becoming.' },
  moon:     { title: 'Moon',       meaning: 'What you need to feel safe, held, and at home in yourself.' },
  mercury:  { title: 'Mercury',    meaning: 'How you think, learn, and communicate.' },
  venus:    { title: 'Venus',      meaning: 'What you love, what you value, and what you are drawn toward.' },
  mars:     { title: 'Mars',       meaning: 'How you take action and assert yourself, and where your drive and desire live.' },
  jupiter:  { title: 'Jupiter',    meaning: 'Where you expand naturally and where life opens up for you.' },
  saturn:   { title: 'Saturn',     meaning: 'Where life demands the most from you, and where mastery lives if you do the work.' },
  chiron:   { title: 'Chiron',     meaning: 'The area of life where you carry your oldest wound. Once you stop running from it, it becomes your greatest source of strength.' },
  uranus:   { title: 'Uranus',     meaning: 'Where you need freedom and where you will break patterns no matter what it costs.' },
  neptune:  { title: 'Neptune',    meaning: 'Your spiritual depth and idealism, and where illusion can either heal or confuse you.' },
  pluto:    { title: 'Pluto',      meaning: 'Where you transform completely and come back different.' },
  northNode:{ title: 'North Node', meaning: 'The direction your soul is moving toward in this life. It will not feel natural. It will feel magnetic.' },
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

const PLANET_SHORT: Record<string, string> = {
  sun:       'your core identity',
  moon:      'your emotional needs',
  mercury:   'how your mind works',
  venus:     'what you love and value',
  mars:      'how you act and assert yourself',
  jupiter:   'where you naturally expand',
  saturn:    'where life demands the most from you',
  chiron:    'your deepest wound',
  uranus:    'your need for freedom',
  neptune:   'your spiritual depth',
  pluto:     'where you transform completely',
  northNode: 'the direction your soul is moving',
}

const ASPECT_TEMPLATE: Record<string, (p1: string, p2: string) => string> = {
  Conjunction: (p1, p2) => `${p1} and ${p2} are fused together in your chart. They act as one force and constantly amplify each other. This is a dominant pairing in how you operate.`,
  Opposition:  (p1, p2) => `${p1} sits in direct tension with ${p2}. You likely swing between the two, or you live one fully while projecting the other onto people around you. The work is learning to hold both at the same time.`,
  Trine:       (p1, p2) => `${p1} flows naturally with ${p2}. This is easy, unforced territory for you. These two energies cooperate without effort. You may not even notice it as a strength because it has always come naturally.`,
  Square:      (p1, p2) => `${p1} is in friction with ${p2}. These two forces pull against each other. You will feel this as internal conflict or as recurring tension in the areas of life they govern. This is not a flaw. It is an engine. The men who do the most with their charts have learned to work with their squares rather than avoid them.`,
  Sextile:     (p1, p2) => `${p1} and ${p2} support each other. This is an opportunity that is available to you when you actively engage it. It does not fire on its own, but when you put energy in, these two work well together.`,
  Quincunx:    (p1, p2) => `${p1} and ${p2} do not naturally communicate. Adjusting one tends to throw the other off. It requires ongoing conscious effort to get them working in the same direction.`,
}

function getAspectText(body1: string, body2: string, type: string): string {
  const p1 = PLANET_SHORT[body1] || body1
  const p2 = PLANET_SHORT[body2] || body2
  const template = ASPECT_TEMPLATE[type]
  if (!template) return ''
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  return template(cap(p1), p2)
}

const SIGN_NATURE: Record<string, { desires: string; avoid: string }> = {
  Aries: {
    desires: 'speed, challenge, and the freedom to act without waiting for permission. It needs to initiate, compete, and see direct results from its effort.',
    avoid: 'If this energy is forced into slow, passive, or heavily controlled environments, it becomes aggression, frustration, or burnout. Aries cannot wait indefinitely — it needs to move.',
  },
  Taurus: {
    desires: 'physical comfort, beauty, consistency, and a pace that does not rush. It needs sensory richness — good food, calm spaces, financial stability, things that last.',
    avoid: 'If this energy is placed in constant chaos, instability, or ugliness, it becomes anxious and depleted. A Taurus placement is not being precious about comfort. It is telling you what it needs to function. Do not put it in conditions that contradict it.',
  },
  Gemini: {
    desires: 'variety, conversation, mental stimulation, and the freedom to move between ideas and people. It needs options, not one fixed path.',
    avoid: 'If this energy is locked into repetitive, isolated, or intellectually flat environments, it becomes restless, scattered, or checked out. The mind needs to keep moving.',
  },
  Cancer: {
    desires: 'safety, belonging, and a home that feels like a sanctuary. It needs privacy, emotional closeness, and the ability to retreat when the world is too much.',
    avoid: 'If this energy has no stable home base — emotionally or physically — it becomes defensive, withdrawn, or chronically unsettled. Cancer placements are not soft. They are telling you that safety is not optional.',
  },
  Leo: {
    desires: 'to be seen, appreciated, and given space to create and lead. It needs genuine recognition — not flattery, but real acknowledgement that what it brings matters.',
    avoid: 'If this energy is consistently ignored, minimised, or kept in the background, it either dims entirely or overcompensates and becomes performative. The need to be witnessed is real. Build a life that allows for it.',
  },
  Virgo: {
    desires: 'order, purpose, and the satisfaction of doing something well. It needs clean systems, meaningful work, and the ability to improve things.',
    avoid: 'If this energy is placed in chaos, purposelessness, or environments where precision is impossible, it becomes hypercritical and anxious. Give it structure and a problem worth solving.',
  },
  Libra: {
    desires: 'harmony, beauty, and genuine partnership. It needs aesthetically pleasing environments, fairness, and relationships that feel reciprocal.',
    avoid: 'If this energy lives in ugly, conflict-heavy, or one-sided environments, it cannot function well. Ugliness and injustice are not small things to a Libra placement — they are draining at a fundamental level. If your chart has Libra strongly placed and you are living in a chaotic or aesthetically harsh environment, that is not trivial. It matters.',
  },
  Scorpio: {
    desires: 'depth, truth, and real intimacy. It needs to go beneath the surface in everything — relationships, work, inner life. Shallow living suffocates it.',
    avoid: 'If this energy is forced into shallow, dishonest, or emotionally closed environments, it becomes suspicious, controlling, or destructive. It needs somewhere to go deep. Give it that.',
  },
  Sagittarius: {
    desires: 'freedom, meaning, and open horizons. It needs to explore — physically, intellectually, philosophically. It cannot be caged for long without consequences.',
    avoid: 'If this energy is locked into rigid routine, small thinking, or environments with no room to grow or roam, it becomes restless, blunt, or escapist. This is not wanderlust as a personality quirk. It is a genuine requirement. A Sagittarius placement locked in a life with no freedom will always be looking for the exit.',
  },
  Capricorn: {
    desires: 'structure, progress, and the slow building of something that lasts. It needs to feel that its effort is moving toward something real and worth building.',
    avoid: 'If this energy is placed in chaotic, purposeless, or unstable environments with no clear path forward, it becomes rigid, cold, or workaholic as a way to cope. It needs a goal worth the climb.',
  },
  Aquarius: {
    desires: 'independence, originality, and the freedom to think and operate differently. It needs intellectual stimulation and space to do things its own way.',
    avoid: 'If this energy is forced into conformity, rigid hierarchies, or environments that punish individuality, it detaches, rebels, or becomes contrarian. It is not being difficult. It is telling you it cannot thrive under those conditions.',
  },
  Pisces: {
    desires: 'quiet, beauty, and spiritual depth. It is sensitive to its environment in ways that are not always obvious — noise, harshness, and ugliness register physically in this energy.',
    avoid: 'If this energy is chronically overwhelmed by loud, harsh, or chaotic environments, it retreats into fantasy, avoidance, or emotional shutdown. A Pisces placement is not being weak. It is telling you it needs a gentler environment to do its best work.',
  },
}

function getPlanetFrame(name: string, sign: string): string {
  switch (name) {
    case 'sun':       return `Your Sun is in ${sign}. This is your core identity — the self you are becoming and the energy you naturally lead with.`
    case 'moon':      return `Your Moon is in ${sign}. This describes what you need to feel emotionally safe and regulated. It is not who you perform as — it is what you require underneath.`
    case 'mercury':   return `Your Mercury is in ${sign}. This is how your mind works — how you think, communicate, and process information.`
    case 'venus':     return `Your Venus is in ${sign}. This describes what you need in love, relationships, and your physical environment. What attracts you, and what you need to feel at home.`
    case 'mars':      return `Your Mars is in ${sign}. This is how you take action, where your drive lives, and what you need to feel energised and purposeful.`
    case 'jupiter':   return `Your Jupiter is in ${sign}. This is where you expand naturally and where life tends to open up when you lean into it.`
    case 'saturn':    return `Your Saturn is in ${sign}. This is where life has demanded the most from you — the area of persistent challenge and, eventually, mastery.`
    case 'uranus':    return `Your Uranus is in ${sign}. This is where you need freedom and where you will disrupt the status quo whether you intend to or not.`
    case 'neptune':   return `Your Neptune is in ${sign}. This is where you idealise, where you are spiritually open, and where illusion can either inspire or mislead.`
    case 'pluto':     return `Your Pluto is in ${sign}. This is where deep transformation is at work — the area of life where you are being fundamentally rebuilt over time.`
    case 'northNode': return `Your North Node is in ${sign}. This is the direction your soul is moving toward in this life — unfamiliar territory that pulls you forward even when it is uncomfortable.`
    default:          return `This placement is in ${sign}.`
  }
}

function planetInterpretation(planet: Planet): string {
  const nature = SIGN_NATURE[planet.sign]
  const houseDesc = HOUSE_MEANING[planet.house]

  const frame = getPlanetFrame(planet.name, planet.sign)

  let text = frame

  if (nature) {
    text += ` ${planet.sign} desires ${nature.desires}`
    if (houseDesc) {
      text += ` This sits in your ${houseDesc.toLowerCase()} — so this desire shows up most directly in that area of your life.`
    }
    text += ` ${nature.avoid}`
  } else if (houseDesc) {
    text += ` It shows up in your ${houseDesc.toLowerCase()}.`
  }

  if (planet.isRetrograde) {
    text += ` This placement is retrograde. That means the energy turns inward before it moves outward. You process it more internally than most. That often leads to deeper understanding over time, but the expression of it is slower and more complex.`
  }

  return text
}

function formatDeg(deg: number): string {
  const d = Math.floor(deg)
  const m = Math.floor((deg - d) * 60)
  return `${d}°${m.toString().padStart(2, '0')}'`
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AstrologyPage() {
  const [form, setForm] = useState({ date: '', time: '', location: '' })
  const [chart, setChart] = useState<NatalChart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'planets' | 'houses' | 'aspects'>('planets')
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)',
    borderRadius: 'var(--kyn-r-lg)', padding: '1.5rem', marginBottom: '1.25rem'
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '0.75rem',
    background: 'var(--kyn-surface-raised)', border: '1px solid var(--kyn-border)',
    borderRadius: 'var(--kyn-r)', color: 'var(--kyn-ink)', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'var(--kyn-font-sans)'
  }

  const chiron = chart?.planets.find(p => p.name === 'chiron')
  const bigThree = chart ? [
    chart.planets.find(p => p.name === 'sun'),
    chart.planets.find(p => p.name === 'moon'),
    { ...chart.ascendant, name: 'ascendant', symbol: '↑', isRetrograde: false, speed: 0 }
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', color: 'var(--kyn-ink)', fontFamily: 'var(--kyn-font-sans)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: isMobile ? '16px 14px 72px' : '28px 32px 52px' }}>

        <Link
          href="/members"
          style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--kyn-green)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '2rem' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--kyn-green-hi)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--kyn-green)'}
        >
          ← Back to Dashboard
        </Link>

        {/* ─── Page title ─── */}
        <div style={{ paddingBottom: '17px', borderBottom: '1px solid var(--kyn-border)', marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'var(--kyn-font-serif)', fontSize: '22px', fontWeight: 400, color: 'var(--kyn-ink)', margin: '0 0 4px 0', lineHeight: 1.2 }}>Your Astrology</h1>
          <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--kyn-ink3)', margin: 0 }}>Planets, wounds, and how the chart reflects who you are</p>
        </div>

        {/* ─── Why astrology? ─── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'var(--kyn-ink3)', fontWeight: 600, marginBottom: '1.25rem' }}>WHY IS THIS IN HERE?</div>
          <p style={{ fontWeight: 300, lineHeight: 1.8, color: 'var(--kyn-ink2)', marginBottom: '1rem', fontSize: '0.9375rem' }}>
            I was sceptical of astrology for years. It felt like something people used to avoid responsibility, so I didn't take it seriously. My mind changed when I opened to the idea that I am factually a complex formulation of energy, as is everything in our universe, including the planets. So why couldn't they affect me? If my ex-girlfriend coming into the room I was sitting in could change the way I felt without any words said, why couldn't these huge balls of energy influence how I felt and, in response, how I behaved?
          </p>
          <p style={{ fontWeight: 300, lineHeight: 1.8, color: 'var(--kyn-ink2)', marginBottom: '1rem', fontSize: '0.9375rem' }}>
            I'm not talking about the horoscopes you can get online. I'm talking about natal charts. Where were the planets positioned when your soul entered this planet? When I was introduced to my natal chart and looked at it properly, I realised it wasn't about prediction at all. A natal chart is a map of the energies present at the moment you were born. Each planet was in a particular sign and house, and those placements describe patterns in how you operate. How you think, what you fear, where you expand naturally, where you contract, what drives you, and what wounds you carry. None of it is destiny. But it is an extremely accurate mirror.
          </p>
          <p style={{ fontWeight: 300, lineHeight: 1.8, color: 'var(--kyn-ink2)', marginBottom: '1rem', fontSize: '0.9375rem' }}>
            The placement I pay most attention to is <strong style={{ fontWeight: 600 }}>Chiron</strong>. Chiron in your chart points directly at the thing you have been compensating for your whole life. It's not a weakness or a flaw, although it can feel like it. It's a wound. The people who have sat with that wound the longest are often the most capable of helping others through the same pain.
          </p>
          <p style={{ fontWeight: 300, lineHeight: 1.8, color: 'var(--kyn-ink2)', fontSize: '0.9375rem', marginBottom: '0' }}>
            You don't need to believe in astrology. Think of it as another language for self-understanding. If it gives you something useful, use it. If it doesn't land, leave it. Working with the planets is simply another way to navigate. Below you can enter your information and find what wound you have been unknowingly carrying around.
          </p>
        </div>

        {/* ─── Form ─── */}
        <div style={card}>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'var(--kyn-ink3)', fontWeight: 600, marginBottom: '1.25rem' }}>YOUR BIRTH DETAILS</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--kyn-ink2)', marginBottom: '0.4rem' }}>Date of birth</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={input} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--kyn-ink2)', marginBottom: '0.4rem' }}>Time of birth</label>
                <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required style={input} />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--kyn-ink2)', marginBottom: '0.4rem' }}>Place of birth</label>
              <input type="text" placeholder="e.g. London, UK · Lagos, Nigeria · New York, US · Mumbai, India" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required style={input} />
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
                background: loading ? 'var(--kyn-surface-raised)' : 'var(--kyn-green)',
                border: 'none', borderRadius: 'var(--kyn-r)',
                color: loading ? 'var(--kyn-ink3)' : '#fff',
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
            <div style={{ fontSize: '0.8rem', color: 'var(--kyn-ink3)', marginBottom: '1.75rem', textAlign: 'center' }}>
              Chart for {chart.birthData.date} · {chart.birthData.time} · {chart.birthData.location}
            </div>

            {/* Big Three */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'var(--kyn-ink3)', fontWeight: 600, marginBottom: '0.875rem' }}>YOUR BIG THREE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'Sun Sign', sub: 'Who you are', planet: chart.planets.find(p => p.name === 'sun') },
                  { label: 'Moon Sign', sub: 'How you feel', planet: chart.planets.find(p => p.name === 'moon') },
                  { label: 'Rising Sign', sub: 'How you appear', planet: { sign: chart.ascendant.sign, signDegree: chart.ascendant.signDegree } as any }
                ].map(({ label, sub, planet }) => planet ? (
                  <div key={label} style={{ background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '9.5px', letterSpacing: '0.1em', color: 'var(--kyn-ink3)', marginBottom: '0.5rem' }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--kyn-ink)', marginBottom: '0.25rem' }}>{planet.sign}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--kyn-ink3)' }}>{sub}</div>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* ─── Chiron highlight ─── */}
            {chiron && (
              <div style={{ ...card, background: 'var(--kyn-green-glow)', border: '1px solid var(--kyn-border-green)', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>⚷</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--kyn-ink)' }}>Chiron in {chiron.sign}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--kyn-ink3)' }}>The Wounded Healer · House {chiron.house}</div>
                  </div>
                </div>
                <p style={{ fontWeight: 300, lineHeight: 1.8, color: 'var(--kyn-ink2)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                  Chiron marks the area of life where you carry an old, persistent wound. You may have become highly capable in this area precisely because the pain pushed you to understand it deeply. That is why it becomes a gift. Not despite the wound, but because of it.
                </p>
                <p style={{ fontWeight: 300, lineHeight: 1.8, color: 'var(--kyn-ink2)', fontSize: '0.9375rem' }}>
                  {CHIRON_WOUND[chiron.sign] || `Your Chiron in ${chiron.sign} points to where your deepest healing work lives.`}
                </p>
              </div>
            )}

            {/* ─── Tabs ─── */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--kyn-border)', paddingBottom: '0' }}>
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
                    borderBottom: activeTab === tab.id ? '2px solid var(--kyn-green)' : '2px solid transparent',
                    color: activeTab === tab.id ? 'var(--kyn-ink)' : 'var(--kyn-ink3)',
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
                        background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: '10px',
                        padding: '1rem 1.25rem', cursor: 'pointer',
                        transition: 'border-color 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--kyn-green)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--kyn-border)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <span style={{ fontSize: '1.25rem', opacity: 0.75, minWidth: '1.5rem', textAlign: 'center' }}>{p.symbol}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{info?.title || PLANET_DISPLAY[p.name]}</span>
                              <span style={{ color: 'var(--kyn-ink2)', fontSize: '0.9375rem' }}>in {p.sign}</span>
                              {p.isRetrograde && <span style={{ fontSize: '10px', color: '#c0392b', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '4px', padding: '0 4px' }}>Rx</span>}
                              <span style={{ fontSize: '0.75rem', color: 'var(--kyn-ink3)' }}>H{p.house}</span>
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--kyn-ink3)', marginTop: '0.1rem' }}>{info?.meaning}</div>
                          </div>
                        </div>
                        <span style={{ color: 'var(--kyn-ink3)', fontSize: '0.875rem', flexShrink: 0, marginLeft: '0.5rem' }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                      {isOpen && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--kyn-border)' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--kyn-ink2)', lineHeight: 1.75 }}>
                            {planetInterpretation(p)}
                          </div>
                          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--kyn-ink3)' }}>
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
                <p style={{ fontSize: '0.875rem', color: 'var(--kyn-ink2)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  There are 12 houses. Each one covers a different area of your life. The sign on each house describes how that area operates for you. If a planet sits in a house, it brings its energy directly into that part of your life.
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
                          background: isAngular ? 'var(--kyn-green-glow)' : 'var(--kyn-surface)',
                          border: `1px solid ${isAngular ? 'var(--kyn-border-green)' : 'var(--kyn-border)'}`,
                          borderRadius: '8px', flexWrap: 'wrap', gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <span style={{ fontSize: '10px', color: 'var(--kyn-ink3)', fontWeight: 600, minWidth: '2rem' }}>H{h.house}</span>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--kyn-ink)', fontWeight: isAngular ? 500 : 400 }}>{HOUSE_MEANING[h.house]}</div>
                            <div style={{ fontSize: '0.775rem', color: 'var(--kyn-ink2)' }}>{h.sign}</div>
                          </div>
                        </div>
                        {planets.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {planets.map(p => (
                              <span key={p.name} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--kyn-surface-raised)', borderRadius: '4px', color: 'var(--kyn-ink2)' }}>
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
                <p style={{ fontSize: '0.875rem', color: 'var(--kyn-ink2)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  Aspects are the angles between planets. They describe how those energies relate to each other. Some flow naturally. Some create friction. The friction ones are not bad. They are often where the most growth comes from.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {chart.aspects.filter(a => a.nature === 'major').map((a, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--kyn-surface)', border: '1px solid var(--kyn-border)', borderRadius: '8px',
                        padding: '0.875rem 1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{PLANET_DISPLAY[a.body1]}</span>
                        <span style={{ fontSize: '1.1rem' }}>{a.symbol}</span>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{PLANET_DISPLAY[a.body2]}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--kyn-ink2)', marginLeft: 'auto' }}>{a.type} · {a.orb}° orb</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--kyn-ink2)', lineHeight: 1.6 }}>
                        {getAspectText(a.body1, a.body2, a.type)}
                      </div>
                    </div>
                  ))}
                  {chart.aspects.filter(a => a.nature === 'minor').length > 0 && (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--kyn-surface)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--kyn-ink3)', marginBottom: '0.5rem' }}>MINOR ASPECTS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {chart.aspects.filter(a => a.nature === 'minor').map((a, i) => (
                          <span key={i} style={{ fontSize: '0.775rem', color: 'var(--kyn-ink2)', padding: '0.25rem 0.625rem', background: 'var(--kyn-surface-raised)', border: '1px solid var(--kyn-border)', borderRadius: '4px' }}>
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
