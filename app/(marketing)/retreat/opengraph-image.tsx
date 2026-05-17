import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const alt = 'A Weekend To Reset What Life Has Buried — True North'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  const mushroomData = readFileSync(path.join(process.cwd(), 'public/mushroom-favicon.png'))
  const mushroomSrc = `data:image/png;base64,${mushroomData.toString('base64')}`

  const fontData = readFileSync(path.join(process.cwd(), 'public/fonts/Gambarino-Regular.woff2'))

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#13140f',
          padding: '64px',
        }}
      >
        {/* Left sage bar */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '4px',
          height: '630px',
          backgroundColor: '#8aaa96',
          display: 'flex',
        }} />

        {/* Mushroom */}
        <img
          src={mushroomSrc}
          width={110}
          height={73}
          style={{ marginBottom: '32px', opacity: 0.92 }}
        />

        {/* Label */}
        <div style={{
          display: 'flex',
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: '#8aaa96',
          marginBottom: '22px',
          fontFamily: 'sans-serif',
        }}>
          True North · UK Countryside · June 2026
        </div>

        {/* Headline */}
        <div style={{
          display: 'flex',
          fontSize: '56px',
          fontWeight: 400,
          color: '#f0ebe0',
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: '880px',
          fontFamily: 'Gambarino',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          A Weekend To Reset What Life Has Buried
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          width: '48px',
          height: '1px',
          backgroundColor: '#8aaa96',
          margin: '28px 0',
        }} />

        {/* Sub */}
        <div style={{
          display: 'flex',
          fontSize: '18px',
          color: 'rgba(240,235,224,0.5)',
          fontFamily: 'sans-serif',
        }}>
          4th to 7th June 2026 · Small Group · Psilocybin Retreat · UK
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Gambarino',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
