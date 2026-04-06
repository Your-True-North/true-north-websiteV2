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
        url: 'https://yourtruenorth.me/cor-og-image.png',
        width: 600,
        height: 600,
        alt: 'Circle of Return',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Circle of Return — Founding Membership',
    description: 'A private circle for men doing the work properly. Founding membership now open.',
    images: ['https://yourtruenorth.me/cor-og-image.png'],
  },
}

export default function FoundingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
