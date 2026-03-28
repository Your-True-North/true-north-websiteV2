// Geocoding via OpenCage API + timezone via geo-tz, with in-memory cache

import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 }) // 24h cache

export interface GeoResult {
  lat: number
  lng: number
  timezone: string
  formattedLocation: string
}

export async function geocodeLocation(location: string): Promise<GeoResult> {
  const key = `geo:${location.toLowerCase().trim()}`
  const cached = cache.get<GeoResult>(key)
  if (cached) return cached

  const apiKey = process.env.OPENCAGE_API_KEY
  if (!apiKey) throw new Error('OPENCAGE_API_KEY not configured')

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}&limit=1&no_annotations=0`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`)

  const data = await res.json()
  if (!data.results?.length) throw new Error(`Location not found: ${location}`)

  const result = data.results[0]
  const { lat, lng } = result.geometry
  const timezone = result.annotations?.timezone?.name

  if (!timezone) throw new Error('Could not determine timezone for location')

  const formatted = result.formatted || location

  const geoResult: GeoResult = { lat, lng, timezone, formattedLocation: formatted }
  cache.set(key, geoResult)
  return geoResult
}

// Convert local birth time to UTC using the timezone
export function localToUTC(
  dateStr: string, timeStr: string, timezone: string
): { year: number; month: number; day: number; hour: number; minute: number } {
  // dateStr: YYYY-MM-DD, timeStr: HH:MM
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)

  // Use Intl to get the UTC offset for this specific date/time in the timezone
  const localDate = new Date(`${dateStr}T${timeStr}:00`)

  // Get UTC offset using Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })

  // Build a date assuming the input is in local time, find the offset
  // We create the date as if it were UTC and then compute the offset
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))

  // Get what Intl thinks this UTC time corresponds to in local timezone
  const parts = formatter.formatToParts(utcDate)
  const localH = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0')
  const localM = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0')
  const localD = parseInt(parts.find(p => p.type === 'day')?.value ?? '0')
  const localMo = parseInt(parts.find(p => p.type === 'month')?.value ?? '0')
  const localY = parseInt(parts.find(p => p.type === 'year')?.value ?? '0')

  // Offset in minutes = (local - UTC)
  const tzDateUTC = new Date(Date.UTC(localY, localMo - 1, localD, localH, localM))
  const offsetMs = tzDateUTC.getTime() - utcDate.getTime()
  const offsetMin = offsetMs / 60000

  // True UTC time
  const trueUTC = new Date(Date.UTC(year, month - 1, day, hour, minute) - offsetMin * 60000)

  return {
    year: trueUTC.getUTCFullYear(),
    month: trueUTC.getUTCMonth() + 1,
    day: trueUTC.getUTCDate(),
    hour: trueUTC.getUTCHours(),
    minute: trueUTC.getUTCMinutes()
  }
}
