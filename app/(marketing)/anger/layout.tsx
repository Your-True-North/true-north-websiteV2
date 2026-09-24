import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Anger Is Something You Do. Not Something You Are. | Know Your North',
  description: "Most men think anger is rage. Underneath it there's something real. KYN is a room of men going into the body to find it.",
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
