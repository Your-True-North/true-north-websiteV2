import type { Metadata } from 'next'
import PowerHourTracker from '@/components/PowerHourTracker'
import { POWER_HOUR_CLIENTS } from '@/lib/power-hour'

// Coach view for True: Jermaine's days so far and his notes.
export const metadata: Metadata = {
  title: "Jermaine's Power Hour: coach view",
  robots: { index: false, follow: false },
  icons: { icon: '/tn-compass-icon.png', apple: '/tn-compass-icon.png' },
}

export default function JermaineCoach() {
  return <PowerHourTracker client={POWER_HOUR_CLIENTS.jermaine} coach />
}
