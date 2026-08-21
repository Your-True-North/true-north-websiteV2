import type { Metadata } from 'next'
import { PROMISE, SUB_LINE } from '../../lib/anger-decoder/config'

export const metadata: Metadata = {
  title: 'The Anger Decoder | Know Your North',
  description: `${PROMISE} ${SUB_LINE}`,
  openGraph: {
    title: PROMISE,
    description: SUB_LINE,
  },
}

export default function AngerDecoderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
