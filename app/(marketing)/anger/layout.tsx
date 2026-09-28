import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'You Weren\'t Born Angry | Know Your North',
  description: "Trying to fix your anger is a waste of time. KYN helps you understand what's really behind it, so you can choose how you respond.",
  // Same as the root list, minus "Circle of Return" — scoped to this page only.
  keywords: 'mens transformation, know your north, masculine coaching, somatic therapy, breathwork, mens community, direction, clarity, mens coaching',
  alternates: {
    canonical: 'https://yourtruenorth.me/anger',
  },
  openGraph: {
    title: "You weren't born angry.",
    description: 'You picked it up along the way. Which means you can put it down.',
    images: [
      {
        url: '/white-green-star.jpg',
        width: 1200,
        height: 630,
        alt: 'Know Your North',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "You weren't born angry.",
    description: 'You picked it up along the way. Which means you can put it down.',
  },
}

export default function AngerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
