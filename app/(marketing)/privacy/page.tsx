import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy policy | Your True North',
  description: 'How Your True North collects, uses and protects your data.',
  alternates: { canonical: '/privacy' },
}

// Same palette and type as the other marketing pages (see short-fuse)
const C = {
  dark: '#13140f',
  darkText: '#f0ebe0',
  darkMuted: '#9a9a8c',
  cream: '#f7f3ec',
  ink: '#1a1a16',
  body: '#3a3a34',
  sageMid: '#6b9079',
}
const serif = '"Gambarino", Georgia, serif'
const sans = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'

const EMAIL = 'navigate@yourtruenorth.me'

const para: React.CSSProperties = { fontSize: '17px', lineHeight: 1.7, color: C.body, margin: '0 0 16px' }
const list: React.CSSProperties = { ...para, paddingLeft: '22px', listStyle: 'disc' }
const item: React.CSSProperties = { margin: '0 0 8px' }
const link: React.CSSProperties = { color: C.sageMid }

function Heading({ children }: { children: string }) {
  return (
    <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(24px, 4vw, 30px)', lineHeight: 1.2, color: C.ink, margin: '40px 0 16px' }}>
      {children}
    </h2>
  )
}

const Email = () => <a href={`mailto:${EMAIL}`} style={link}>{EMAIL}</a>

export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: sans }}>
      <section style={{ background: C.dark, padding: 'clamp(112px, 14vw, 160px) 24px clamp(48px, 8vw, 80px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(40px, 8vw, 60px)', lineHeight: 1.05, color: C.darkText, margin: '0 0 20px' }}>
            Privacy policy
          </h1>
          <p style={{ fontSize: '15px', color: C.darkMuted, margin: 0 }}>Last updated: 1 November 2026</p>
        </div>
      </section>

      <section style={{ background: C.cream, padding: 'clamp(24px, 6vw, 56px) 24px clamp(64px, 10vw, 112px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Heading>Who we are</Heading>
          <p style={para}>
            Your True North (yourtruenorth.me) is run by True. If you have any questions about your data, email <Email />.
          </p>

          <Heading>What we collect</Heading>
          <ul style={list}>
            <li style={item}>Your email address when you sign up for a free course or my emails.</li>
            <li style={item}>Your name and account details if you become a member.</li>
            <li style={item}>How you found the site (for example, from Instagram), using tracking tags in the link.</li>
            <li style={item}>How you use the site, through the Meta pixel (see Cookies below).</li>
            <li style={item}>Payment details if you become a member. These are handled by Stripe. We never see or store your full card number.</li>
            <li style={item}>What you type into the Anger Decoder. Your answers are sent to Anthropic&apos;s AI to write your results.</li>
            <li style={item}>Details you give when you book a call or join a live session (through Calendly and Zoom).</li>
          </ul>

          <Heading>Why we use it</Heading>
          <ul style={list}>
            <li style={item}>To send you what you signed up for, and my emails. You can unsubscribe at any time using the link at the bottom of every email.</li>
            <li style={item}>To provide your membership if you join.</li>
            <li style={item}>To understand which posts and adverts bring people to the site.</li>
            <li style={item}>To write your Anger Decoder results.</li>
          </ul>

          <Heading>Who we share it with</Heading>
          <p style={para}>We don&apos;t sell your data. We use trusted services to run the site:</p>
          <ul style={list}>
            <li style={item}>Kit (ConvertKit): sends our emails.</li>
            <li style={item}>Meta: measures visits and signups from Instagram and Facebook.</li>
            <li style={item}>Vercel: hosts the website.</li>
            <li style={item}>Railway: stores member accounts.</li>
            <li style={item}>Stripe: takes membership payments.</li>
            <li style={item}>Resend: sends account and membership emails, such as password resets and session reminders.</li>
            <li style={item}>Zoom: runs our live sessions.</li>
            <li style={item}>Calendly: books calls with us.</li>
            <li style={item}>Google: Google Analytics measures how the site is used.</li>
            <li style={item}>YouTube and Vimeo: play the videos on the site.</li>
            <li style={item}>ManyChat: runs our Instagram messages and the chat on the site.</li>
            <li style={item}>Anthropic: the Anger Decoder sends your answers to Anthropic&apos;s AI to write your results.</li>
          </ul>
          <p style={para}>Some of these services are based outside the UK. They&apos;re required to protect your data to UK standards.</p>

          <Heading>How long we keep it</Heading>
          <p style={para}>
            Until you unsubscribe or ask us to delete it. Some membership and payment records are kept for as long as the law requires for tax and accounting.
          </p>

          <Heading>Your rights</Heading>
          <p style={para}>
            You can ask to see the data we hold about you, correct it, delete it, or stop us using it. Email <Email /> and we&apos;ll respond within one month. If you&apos;re unhappy with how we&apos;ve handled your data, you can complain to the Information Commissioner&apos;s Office at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={link}>ico.org.uk</a>.
          </p>

          <Heading>Cookies</Heading>
          <p style={para}>The site uses cookies from these services:</p>
          <ul style={list}>
            <li style={item}>Meta pixel: measures visits and signups from Instagram and Facebook.</li>
            <li style={item}>Google Analytics: measures how the site is used.</li>
            <li style={item}>YouTube and Vimeo: play the videos on the site.</li>
            <li style={item}>ManyChat: runs the chat on the site.</li>
          </ul>
          <p style={para}>
            You can block or delete cookies in your browser settings. Some parts of the site, like videos, may not work properly if you do.
          </p>

          <Heading>Changes</Heading>
          <p style={{ ...para, marginBottom: 0 }}>If we change this policy, we&apos;ll update the date at the top of this page.</p>
        </div>
      </section>
    </div>
  )
}
