import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Know Your North — Founding Member',
  description: 'Join KYN for your first month at £10. Limited spots. Real work, not a lecture.',
  openGraph: {
    title: 'Know Your North — Founding Member',
    description: 'Join KYN for your first month at £10. Limited spots. Real work, not a lecture.',
    images: [
      {
        url: '/og-kyn-founding.png',
        width: 1200,
        height: 630,
        alt: 'Know Your North — Founding Member',
      },
    ],
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Know Your North — Founding Member',
    description: 'Join KYN for your first month at £10. Limited spots. Real work, not a lecture.',
    images: ['/og-kyn-founding.png'],
  },
}

export default function FoundingIntroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
