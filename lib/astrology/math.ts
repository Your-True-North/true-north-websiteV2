// Angular math utilities for astronomical calculations

export const RAD = Math.PI / 180
export const DEG = 180 / Math.PI

export function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360
}

export function normRad(rad: number): number {
  return ((rad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
}

export function toJulianDay(
  year: number, month: number, day: number,
  hour: number, minute: number, second = 0
): number {
  let y = year
  let m = month
  if (m <= 2) { y -= 1; m += 12 }
  const d = day + (hour + minute / 60 + second / 3600) / 24
  const A = Math.trunc(y / 100)
  const B = 2 - A + Math.trunc(A / 4)
  return Math.trunc(365.25 * (y + 4716)) + Math.trunc(30.6001 * (m + 1)) + d + B - 1524.5
}

export function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525
}

export function greenwichSiderealTime(jd: number): number {
  // GMST in degrees (Meeus Ch. 12)
  const T = julianCenturies(jd)
  const θ = 280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T
    - (T * T * T) / 38710000
  return norm360(θ)
}

export function localSiderealTime(jd: number, lngDeg: number): number {
  return norm360(greenwichSiderealTime(jd) + lngDeg)
}

export function obliquity(jd: number): number {
  // Mean obliquity of ecliptic in degrees (Meeus Ch. 22)
  const T = julianCenturies(jd)
  return 23.439291111
    - 0.013004167 * T
    - 0.0000001639 * T * T
    + 0.0000005036 * T * T * T
}

export function zodiacSign(lon: number): { sign: string; signDegree: number } {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ]
  const n = Math.floor(lon / 30) % 12
  return { sign: signs[n], signDegree: lon % 30 }
}

// Solve Kepler's equation M = E - e*sin(E) for E
export function keplerSolve(M_deg: number, e: number): number {
  let M = M_deg * RAD
  let E = M
  for (let i = 0; i < 50; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E))
    E += dE
    if (Math.abs(dE) < 1e-10) break
  }
  return E // radians
}

// True anomaly from eccentric anomaly
export function trueAnomaly(E_rad: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E_rad / 2),
    Math.sqrt(1 - e) * Math.cos(E_rad / 2)
  )
}
