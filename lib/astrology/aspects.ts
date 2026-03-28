// Aspect detection with standard astrological orbs

import { norm360 } from './math'

export interface AspectDef {
  name: string
  angle: number
  orb: number
  nature: 'major' | 'minor'
  symbol: string
}

export const ASPECT_DEFS: AspectDef[] = [
  { name: 'Conjunction',  angle:   0, orb: 8, nature: 'major', symbol: '☌' },
  { name: 'Opposition',   angle: 180, orb: 8, nature: 'major', symbol: '☍' },
  { name: 'Trine',        angle: 120, orb: 6, nature: 'major', symbol: '△' },
  { name: 'Square',       angle:  90, orb: 6, nature: 'major', symbol: '□' },
  { name: 'Sextile',      angle:  60, orb: 4, nature: 'major', symbol: '⚹' },
  { name: 'Quincunx',     angle: 150, orb: 3, nature: 'minor', symbol: '⚻' },
  { name: 'Semisextile',  angle:  30, orb: 2, nature: 'minor', symbol: '⚺' },
  { name: 'Semisquare',   angle:  45, orb: 2, nature: 'minor', symbol: '∠' },
  { name: 'Sesquisquare', angle: 135, orb: 2, nature: 'minor', symbol: '⚼' },
]

export interface Aspect {
  body1: string
  body2: string
  type: string
  symbol: string
  angle: number      // actual angle between bodies
  orb: number        // deviation from exact
  applying: boolean  // bodies moving toward exact
  nature: 'major' | 'minor'
}

function angularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(norm360(lon1) - norm360(lon2))
  return diff > 180 ? 360 - diff : diff
}

export function calculateAspects(
  bodies: Array<{ name: string; lon: number; speed?: number }>
): Aspect[] {
  const aspects: Aspect[] = []

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i]
      const b2 = bodies[j]
      const angle = angularDistance(b1.lon, b2.lon)

      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(angle - def.angle)
        if (orb <= def.orb) {
          // Determine applying/separating using speeds
          const speed1 = b1.speed ?? 0
          const speed2 = b2.speed ?? 0
          const relativeSpeed = speed1 - speed2
          const diff = norm360(b1.lon) - norm360(b2.lon)
          const applying = (relativeSpeed > 0 && diff < 0) || (relativeSpeed < 0 && diff > 0)

          aspects.push({
            body1: b1.name,
            body2: b2.name,
            type: def.name,
            symbol: def.symbol,
            angle: Math.round(angle * 100) / 100,
            orb: Math.round(orb * 100) / 100,
            applying,
            nature: def.nature,
          })
          break // Only one aspect per pair
        }
      }
    }
  }

  // Sort: major first, then by orb
  return aspects.sort((a, b) => {
    if (a.nature !== b.nature) return a.nature === 'major' ? -1 : 1
    return a.orb - b.orb
  })
}
