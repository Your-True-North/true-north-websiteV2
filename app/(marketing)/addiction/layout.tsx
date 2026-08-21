import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "What Are You Drowning Out? | Know Your North",
  description: "Rehab treats the behaviour. This finds what's underneath it, so you can actually put it down. KYN goes under the pattern your nervous system learned, not just the habit itself.",
  openGraph: {
    title: "What are you drowning out?",
    description: "Rehab treats the behaviour. This finds what's underneath it, so you can actually put it down.",
    images: ['/grey-face-green-star.png'],
  },
}

export default function AddictionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
