import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = "It's never really about what triggers you. The Short Fuse, a free 14 day course from True."
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const HEADLINE = "It's never really about what triggers you."

// Archivo at two fixed widths, saved in og-fonts (Satori can't use a variable
// font, and fetching from Google during the build failed on Vercel). The files
// only hold capitals, numbers and the few marks used here.
async function font(file: string) {
  return readFile(join(process.cwd(), 'app/shortfuse/og-fonts', file))
}

export default async function Image() {
  const [big, small] = await Promise.all([
    font('archivo-condensed-800.ttf'),
    font('archivo-expanded-700.ttf'),
  ])
  const fonts = [
    { name: 'Big', data: big, weight: 800 as const },
    { name: 'Small', data: small, weight: 700 as const },
  ]

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f2ee', color: '#1e2a38', padding: '44px 56px 52px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #1e2a38', paddingBottom: 16, fontFamily: 'Small', fontWeight: 700, fontSize: 24, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          <span>Your True North</span>
          <span>Free · 14 days</span>
        </div>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', fontFamily: 'Big', fontWeight: 800, fontSize: 132, lineHeight: 0.86, textTransform: 'uppercase', letterSpacing: -1 }}>
          {HEADLINE}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '4px solid #1e2a38', paddingTop: 16, fontFamily: 'Small', fontWeight: 700, fontSize: 24, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          <span>The Short Fuse</span>
          <span style={{ background: '#7ba69b', width: 72, height: 24 }} />
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
