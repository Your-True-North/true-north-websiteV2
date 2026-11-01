import { ImageResponse } from 'next/og'

export const alt = "It's never really about what triggers you. The Short Fuse, a free 14 day course from True."
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const HEADLINE = "It's never really about what triggers you."
const SMALL = 'Your True NorthFree · 14 daysThe Short Fuse'

// Archivo at a fixed width and weight. Satori can't use a variable font, so ask
// Google for a static TTF cut of just the letters we draw.
async function archivo(wdth: number, wght: number, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@${wdth},${wght}&text=${encodeURIComponent(text)}`)).text()
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
    return url ? await (await fetch(url)).arrayBuffer() : null
  } catch {
    return null
  }
}

export default async function Image() {
  const [big, small] = await Promise.all([
    archivo(62.5, 800, HEADLINE.toUpperCase()),
    archivo(125, 700, SMALL.toUpperCase()),
  ])
  const fonts = [
    ...(big ? [{ name: 'Big', data: big, weight: 800 as const }] : []),
    ...(small ? [{ name: 'Small', data: small, weight: 700 as const }] : []),
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
