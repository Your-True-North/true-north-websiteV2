import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Anger Is Something You Do. Not Something You Are. | Know Your North',
  description: "Trying to fix your anger is a waste of time. KYN helps you understand what's really behind it, so you can choose how you respond.",
  alternates: {
    canonical: 'https://yourtruenorth.me/anger',
  },
  openGraph: {
    title: 'Anger is something you do. Not something you are.',
    description: 'Let me explain.',
  },
  twitter: {
    title: 'Anger is something you do. Not something you are.',
    description: 'Let me explain.',
  },
}

export default function AngerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
