import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Know Your North — Founding Membership',
  description: 'A brotherhood for men doing the work properly. Founding membership now open.',
  openGraph: {
    title: 'Know Your North — Founding Membership',
    description: 'A brotherhood for men doing the work properly. Founding membership now open.',
    url: 'https://yourtruenorth.me/founding',
    type: 'website',
    images: [
      {
        url: 'https://yourtruenorth.me/kyn-stacked-black.png',
        width: 600,
        height: 600,
        alt: 'Know Your North',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Know Your North — Founding Membership',
    description: 'A brotherhood for men doing the work properly. Founding membership now open.',
    images: ['https://yourtruenorth.me/kyn-stacked-black.png'],
  },
}

export default function FoundingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
