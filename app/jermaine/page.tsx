import type { Metadata } from 'next'
import PowerHourTracker from '@/components/PowerHourTracker'
import { POWER_HOUR_CLIENTS } from '@/lib/power-hour'

// Jermaine's Power Hour Tasks: public page, no sign-in needed.
const TITLE = "Jermaine's Power Hour Tasks"
const DESCRIPTION = 'Your daily tasks from True North. Tick them off as you go.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  icons: { icon: '/tn-compass-icon.png', apple: '/tn-compass-icon.png' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: 'https://yourtruenorth.me/jermaine',
    siteName: 'True North',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function JermainePage() {
  return <PowerHourTracker client={POWER_HOUR_CLIENTS.jermaine} />
}
