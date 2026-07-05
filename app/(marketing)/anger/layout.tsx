import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "You're Not an Angry Man | Know Your North",
  description: 'Find where your anger is actually coming from, and put it down for good. KYN is somatic, real, and built for men who are done with the guilt cycle.',
  openGraph: {
    title: "You're not an angry man. You're carrying anger.",
    description: "Find where it's actually coming from, so you can put it down for good.",
  },
}

export default function AngerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
