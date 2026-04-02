import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Circle of Return — Founding Membership',
  description: 'A private circle for men doing the work properly. Founding membership now open.',
  openGraph: {
    title: 'Circle of Return — Founding Membership',
    description: 'A private circle for men doing the work properly. Founding membership now open.',
    url: 'https://yourtruenorth.me/founding',
    type: 'website',
    images: [
      {
        url: 'https://yourtruenorth.me/cor-logo.png',
        width: 1080,
        height: 1080,
        alt: 'Circle of Return',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Circle of Return — Founding Membership',
    description: 'A private circle for men doing the work properly. Founding membership now open.',
    images: ['https://yourtruenorth.me/cor-logo.png'],
  },
}

export default function FoundingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
