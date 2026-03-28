import { NextRequest, NextResponse } from 'next/server'
import { toJulianDay, zodiacSign } from '@/lib/astrology/math'
import {
  sunPosition, moonPosition, planetPosition,
  plutoPosition, northNodePosition, chironPosition
} from '@/lib/astrology/ephemeris'
import { calculateHouses, whichHouse } from '@/lib/astrology/houses'
import { calculateAspects } from '@/lib/astrology/aspects'
import { geocodeLocation, localToUTC } from '@/lib/astrology/geocoding'

export const runtime = 'nodejs'

const PLANET_NAMES = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune',
  'pluto', 'northNode', 'chiron'
]

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☀', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆',
  pluto: '♇', northNode: '☊', chiron: '⚷'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { date, time, location, lat: providedLat, lng: providedLng } = body

    if (!date || !time) {
      return NextResponse.json({ error: 'date and time are required' }, { status: 400 })
    }
    if (!location && (providedLat === undefined || providedLng === undefined)) {
      return NextResponse.json({ error: 'location or lat/lng required' }, { status: 400 })
    }

    // ─── 1. Geocode + timezone ───────────────────────────────────────────────
    let lat = providedLat
    let lng = providedLng
    let timezone = 'UTC'
    let formattedLocation = location || `${lat}, ${lng}`

    if (location && (providedLat === undefined || providedLng === undefined)) {
      const geo = await geocodeLocation(location)
      lat = geo.lat
      lng = geo.lng
      timezone = geo.timezone
      formattedLocation = geo.formattedLocation
    } else if (location) {
      // Still look up timezone even if coords provided
      try {
        const geo = await geocodeLocation(location)
        timezone = geo.timezone
        formattedLocation = geo.formattedLocation
      } catch {
        // Use geo-tz fallback if geocoding fails but coords available
        try {
          const { find } = await import('geo-tz')
          const tzList = find(lat, lng)
          if (tzList.length) timezone = tzList[0]
        } catch {}
      }
    } else {
      // Only coords provided, use geo-tz
      try {
        const { find } = await import('geo-tz')
        const tzList = find(lat, lng)
        if (tzList.length) timezone = tzList[0]
      } catch {}
    }

    // ─── 2. Convert to UTC and compute JD ───────────────────────────────────
    const utc = localToUTC(date, time, timezone)
    const jd = toJulianDay(utc.year, utc.month, utc.day, utc.hour, utc.minute)

    // ─── 3. Compute house system ─────────────────────────────────────────────
    const houseData = calculateHouses(jd, lat, lng)

    // ─── 4. Compute planetary positions ─────────────────────────────────────
    const rawPositions: Record<string, { lon: number; lat: number; speed?: number }> = {}

    rawPositions.sun      = sunPosition(jd)
    rawPositions.moon     = moonPosition(jd)
    rawPositions.mercury  = planetPosition('mercury', jd)
    rawPositions.venus    = planetPosition('venus', jd)
    rawPositions.mars     = planetPosition('mars', jd)
    rawPositions.jupiter  = planetPosition('jupiter', jd)
    rawPositions.saturn   = planetPosition('saturn', jd)
    rawPositions.uranus   = planetPosition('uranus', jd)
    rawPositions.neptune  = planetPosition('neptune', jd)
    rawPositions.pluto    = plutoPosition(jd)
    rawPositions.northNode = northNodePosition(jd)
    rawPositions.chiron   = chironPosition(jd)

    // ─── 5. Assign signs, degrees, houses ───────────────────────────────────
    const planets = PLANET_NAMES.map(name => {
      const pos = rawPositions[name]
      const { sign, signDegree } = zodiacSign(pos.lon)
      const house = whichHouse(pos.lon, houseData.cusps)
      const speed = pos.speed ?? 0
      const isRetrograde = speed < 0

      return {
        name,
        symbol: PLANET_SYMBOLS[name] || '',
        longitude: Math.round(pos.lon * 1000) / 1000,
        latitude: Math.round((pos.lat || 0) * 1000) / 1000,
        sign,
        signDegree: Math.round(signDegree * 100) / 100,
        house,
        isRetrograde,
        speed: Math.round(speed * 1000) / 1000,
        // Approximate flag for less accurate bodies
        isApproximate: ['pluto', 'chiron'].includes(name)
      }
    })

    // ─── 6. Calculate aspects ────────────────────────────────────────────────
    const aspectBodies = planets
      .filter(p => !['northNode', 'chiron'].includes(p.name))
      .map(p => ({ name: p.name, lon: p.longitude, speed: p.speed }))

    const aspects = calculateAspects(aspectBodies)

    // ─── 7. Build response ───────────────────────────────────────────────────
    // Compute UTC offset for display
    const utcDate = new Date(Date.UTC(utc.year, utc.month - 1, utc.day, utc.hour, utc.minute))
    const localDate = new Date(`${date}T${time}:00`)
    const utcOffsetMin = Math.round((localDate.getTime() - utcDate.getTime()) / 60000)
    const utcOffsetHrs = utcOffsetMin / 60

    const chart = {
      birthData: {
        date,
        time,
        location: formattedLocation,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        timezone,
        utcOffset: utcOffsetHrs,
        julianDay: Math.round(jd * 10000) / 10000
      },
      planets,
      ascendant: {
        ...houseData.ascendant,
        signDegree: Math.round(houseData.ascendant.signDegree * 100) / 100
      },
      midheaven: {
        ...houseData.midheaven,
        signDegree: Math.round(houseData.midheaven.signDegree * 100) / 100
      },
      houses: houseData.cusps.map(c => ({
        ...c,
        signDegree: Math.round(c.signDegree * 100) / 100
      })),
      aspects,
      calculatedAt: new Date().toISOString()
    }

    return NextResponse.json(chart)
  } catch (err: any) {
    console.error('[natal-chart]', err)
    return NextResponse.json(
      { error: err.message || 'Calculation failed' },
      { status: 500 }
    )
  }
}
