import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Psilocybin Weekend Retreat · True North',
  description: 'A small group psilocybin retreat in the UK countryside. Deep clarity, emotional release and genuine reconnection. 4th to 7th June 2026.',
  icons: {
    icon: '/mushroom-favicon.png',
    shortcut: '/mushroom-favicon.png',
    apple: '/mushroom-favicon.png',
  },
  openGraph: {
    title: 'A Weekend To Reset What Life Has Buried',
    description: 'A small group psilocybin retreat in the UK countryside. 4th to 7th June 2026.',
    url: 'https://yourtruenorth.me/retreat',
    siteName: 'True North',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Weekend To Reset What Life Has Buried',
    description: 'A small group psilocybin retreat in the UK countryside. 4th to 7th June 2026.',
  },
}

export default function RetreatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
