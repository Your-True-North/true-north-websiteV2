import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "The MAP | Men's Anger Programme",
  description: '12 weeks of deep, structured work for men ready to understand where their anger comes from and dismantle it at the root. 10 men, live on Zoom.',
}

const BOOK_URL = 'https://calendly.com/callwithmason/the-map'

// Same palette and type as the other marketing pages (see retreat)
const C = {
  dark: '#13140f',
  darkText: '#f0ebe0',
  darkMuted: '#9a9a8c',
  cream: '#f7f3ec',
  stone: '#eae4d8',
  ink: '#1a1a16',
  body: '#3a3a34',
  muted: '#7a7a6e',
  sage: '#8aaa96',
  sageMid: '#6b9079',
  border: '#ddd7cc',
}
const serif = '"Gambarino", Georgia, serif'
const sans = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'

const forYou = [
  "You know your anger is costing you, even if you've never said it out loud.",
  "You haven't raised your voice in months and you're still angry. The tightness in your chest, the short answers, the low level irritation that follows you through the day.",
  'The people around you walk on eggshells, and your mates have stopped challenging you because they know what happens.',
  'You keep the lid on in public and apologise after when you don\'t.',
  "You're ready to meet what's underneath, not learn another trick to manage it.",
]

const phases = [
  {
    weeks: 'Weeks 1 to 4',
    title: 'Self-Exploration',
    body: "We start by looking at how you see yourself. Because your outer world, your reactions, your triggers, all of it, is a reflection of your inner world. You'll begin to understand why you act and react to life the way you do, and why certain things hit you harder than they should. We create distance between the true you and the conditioned parts of you that have been running the show.",
  },
  {
    weeks: 'Weeks 5 to 8',
    title: 'Self-Discovery',
    body: "This is where we get out of your head and into your body. Your mind has compartmentalised the pain away. You think it's dealt with, but your body hasn't forgotten. Somatic work, nervous system recalibration, connecting to the parts of yourself you didn't know were there: the parts holding you back, and the parts needed to take you forward.",
  },
  {
    weeks: 'Weeks 9 to 12',
    title: 'Personal Blueprint',
    body: "We don't just clear out the old. We build the new. Whether it's your relationships, your career, your emotional control, or all of it, we work towards the life you actually want from a place that is fully aligned with who you are.",
  },
]

const format = [
  ['Length', '12 weeks'],
  ['Group', '10 men'],
  ['Where', 'Live on Zoom'],
  ['When', 'Tuesdays at 7am UK time'],
]

function Label({ children, light }: { children: string; light?: boolean }) {
  return (
    <p style={{ fontFamily: sans, fontSize: '11px', letterSpacing: '3.5px', textTransform: 'uppercase', color: light ? C.sage : C.sageMid, margin: '0 0 20px' }}>
      {children}
    </p>
  )
}

function Heading({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(30px, 5vw, 44px)', lineHeight: 1.15, color: light ? C.darkText : C.ink, margin: '0 0 24px' }}>
      {children}
    </h2>
  )
}

function Section({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <section style={{ background: bg, padding: 'clamp(64px, 10vw, 112px) 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>{children}</div>
    </section>
  )
}

function CTA({ label = 'Book your discovery call' }: { label?: string }) {
  return (
    <Link
      href={BOOK_URL}
      style={{ display: 'inline-block', background: C.sage, color: C.ink, padding: '16px 36px', borderRadius: '4px', fontFamily: sans, fontWeight: 600, fontSize: '16px', textDecoration: 'none' }}
    >
      {label}
    </Link>
  )
}

const para = (light?: boolean): React.CSSProperties => ({
  fontFamily: sans, fontSize: '17px', lineHeight: 1.7, color: light ? C.darkMuted : C.body, margin: '0 0 20px',
})

export default function MapPage() {
  return (
    <div style={{ fontFamily: sans }}>
      {/* Hero */}
      <Section bg={C.dark}>
        <Label light>The MAP · Men&apos;s Anger Programme</Label>
        <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(40px, 8vw, 68px)', lineHeight: 1.05, color: C.darkText, margin: '0 0 28px' }}>
          Your anger is not the problem.
        </h1>
        <p style={para(true)}>
          Anger is the bodyguard. It&apos;s the big loud thing standing at the door making sure nobody gets to see what&apos;s behind it.
        </p>
        <p style={{ ...para(true), marginBottom: '36px' }}>
          This is not anger management. The MAP is 12 weeks of deep, structured work to understand where your anger actually comes from and dismantle it at the root.
        </p>
        <CTA />
        <p style={{ ...para(true), fontSize: '14px', margin: '16px 0 0' }}>10 men. 12 weeks. A conversation to start.</p>
      </Section>

      {/* Who it's for */}
      <Section bg={C.cream}>
        <Label>Who it&apos;s for</Label>
        <Heading>You can be angry for years without ever raising your voice.</Heading>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
          {forYou.map(line => (
            <li key={line} style={{ ...para(), borderTop: `1px solid ${C.border}`, padding: '18px 0 0', margin: '0 0 18px' }}>{line}</li>
          ))}
        </ul>
        <p style={{ ...para(), color: C.muted }}>
          It isn&apos;t for you if you&apos;re looking for a quick fix, or you think your anger is everyone else&apos;s fault.
        </p>
      </Section>

      {/* The three phases */}
      <Section bg={C.stone}>
        <Label>The three phases</Label>
        <Heading>Managing it is not the same as being free of it.</Heading>
        {phases.map((p, i) => (
          <div key={p.title} style={{ borderTop: `1px solid ${C.border}`, padding: '28px 0' }}>
            <p style={{ fontFamily: sans, fontSize: '13px', color: C.sageMid, margin: '0 0 8px' }}>{`0${i + 1} · ${p.weeks}`}</p>
            <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: '28px', color: C.ink, margin: '0 0 14px' }}>{p.title}</h3>
            <p style={{ ...para(), margin: 0 }}>{p.body}</p>
          </div>
        ))}
      </Section>

      {/* Format */}
      <Section bg={C.cream}>
        <Label>Format</Label>
        <Heading>You&apos;re not the only man carrying this.</Heading>
        <dl style={{ margin: '0 0 32px' }}>
          {format.map(([term, value]) => (
            <div key={term} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', borderTop: `1px solid ${C.border}`, padding: '16px 0' }}>
              <dt style={{ fontFamily: sans, fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: C.muted, minWidth: '96px' }}>{term}</dt>
              <dd style={{ fontFamily: sans, fontSize: '17px', color: C.ink, margin: 0 }}>{value}</dd>
            </div>
          ))}
        </dl>
        <p style={para()}>
          This isn&apos;t group therapy where you sit in a circle and talk about your feelings for an hour. It&apos;s structured, deep, guided work: somatic practices, nervous system work, real tools. But it happens alongside men who are in it with you, and that changes the experience completely.
        </p>
        <p style={para()}>
          You don&apos;t have to be ready to share your life story on day one. You just have to be willing to show up honestly.
        </p>
      </Section>

      {/* Price */}
      <Section bg={C.dark}>
        <Label light>Investment</Label>
        <p style={{ fontFamily: serif, fontSize: 'clamp(40px, 7vw, 60px)', color: C.darkText, margin: '0 0 8px' }}>£333 per month</p>
        <p style={{ ...para(true), marginBottom: '28px' }}>for three months</p>
        <p style={para(true)}>
          The cost of anger isn&apos;t just the outburst. It&apos;s the trust that slowly disappears, the distance that grows between you and the people who love you, and the guilt you carry silently.
        </p>
      </Section>

      {/* Call to action */}
      <Section bg={C.cream}>
        <Label>The first step</Label>
        <Heading>A conversation to start.</Heading>
        <p style={para()}>
          We&apos;ll have a real conversation. There is zero pressure. I&apos;ll ask you some questions, you&apos;ll ask me some, and we&apos;ll both know if it&apos;s right.
        </p>
        <p style={{ ...para(), marginBottom: '32px' }}>
          No one can do the work for you. But you don&apos;t have to figure it out alone either.
        </p>
        <CTA />
      </Section>
    </div>
  )
}
