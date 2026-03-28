// Placidus house system (Meeus Ch. 24 iterative algorithm)

import { RAD, DEG, norm360, obliquity, localSiderealTime } from './math'
import { zodiacSign } from './math'

export interface HouseCusp {
  house: number
  longitude: number
  sign: string
  signDegree: number
}

export interface HouseData {
  cusps: HouseCusp[]      // houses 1-12
  ascendant: HouseCusp
  midheaven: HouseCusp
  ramc: number            // degrees
}

function eclipticFromRA(ra_deg: number, eps_rad: number): number {
  // Given RA on the ecliptic (lat≈0), return ecliptic longitude
  // tan(λ) = tan(RA) / cos(ε)
  const ra = ra_deg * RAD
  return norm360(Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(eps_rad)) * DEG)
}

function raFromEcliptic(lon_deg: number, eps_rad: number): number {
  const l = lon_deg * RAD
  return norm360(Math.atan2(Math.sin(l) * Math.cos(eps_rad), Math.cos(l)) * DEG)
}

function decFromEcliptic(lon_deg: number, eps_rad: number): number {
  return Math.asin(Math.sin(eps_rad) * Math.sin(lon_deg * RAD)) * DEG
}

// Iterative Placidus intermediate house cusp
// fraction = 1/3 or 2/3 of the semi-arc from meridian
// isDiurnal: true = upper hemisphere (H11, H12), false = lower (H3, H2)
function placidusIntermediate(
  ramc: number, eps_rad: number, lat_rad: number,
  fraction: number, isDiurnal: boolean,
  initialGuess: number
): number {
  let lon = norm360(initialGuess)

  for (let i = 0; i < 30; i++) {
    const dec = decFromEcliptic(lon, eps_rad) * RAD
    const tanProduct = Math.tan(lat_rad) * Math.tan(dec)

    // Clamp to avoid circumpolar issues
    const clampedTan = Math.max(-0.9999, Math.min(0.9999, tanProduct))
    const AD = Math.asin(clampedTan) * DEG  // Ascensional Difference

    let semiArc: number
    let targetRA: number

    if (isDiurnal) {
      semiArc = 90 + AD
      targetRA = norm360(ramc + fraction * semiArc)
    } else {
      semiArc = 90 - AD
      targetRA = norm360(ramc + 180 + fraction * semiArc)
    }

    const newLon = eclipticFromRA(targetRA, eps_rad)
    const diff = Math.abs(newLon - lon)
    lon = newLon

    if (diff < 0.0001) break
  }

  return norm360(lon)
}

export function calculateHouses(jd: number, lat: number, lng: number): HouseData {
  const eps = obliquity(jd)
  const eps_r = eps * RAD
  const ramc = localSiderealTime(jd, lng)  // RAMC in degrees
  const lat_r = lat * RAD
  const ramc_r = ramc * RAD

  // ─── MC (10th house cusp) ────────────────────────────────────────────────
  const mc_lon = norm360(
    Math.atan2(Math.sin(ramc_r), Math.cos(ramc_r) * Math.cos(eps_r)) * DEG
  )

  // ─── ASC (1st house cusp) ────────────────────────────────────────────────
  const asc_lon = norm360(
    Math.atan2(
      -Math.cos(ramc_r),
      Math.sin(eps_r) * Math.tan(lat_r) + Math.cos(eps_r) * Math.sin(ramc_r)
    ) * DEG
  )

  // ─── Intermediate Placidus cusps ─────────────────────────────────────────
  const h11 = placidusIntermediate(ramc, eps_r, lat_r, 1/3, true,  mc_lon + 30)
  const h12 = placidusIntermediate(ramc, eps_r, lat_r, 2/3, true,  mc_lon + 60)
  const h2  = placidusIntermediate(ramc, eps_r, lat_r, 1/3, false, mc_lon + 210)
  const h3  = placidusIntermediate(ramc, eps_r, lat_r, 2/3, false, mc_lon + 240)

  // Opposite houses
  const ic  = norm360(mc_lon  + 180)
  const dsc = norm360(asc_lon + 180)
  const h5  = norm360(h11 + 180)
  const h6  = norm360(h12 + 180)
  const h8  = norm360(h2  + 180)
  const h9  = norm360(h3  + 180)

  const lonToHouseCusp = (h: number, lon: number): HouseCusp => {
    const { sign, signDegree } = zodiacSign(lon)
    return { house: h, longitude: lon, sign, signDegree }
  }

  const cusps: HouseCusp[] = [
    lonToHouseCusp(1, asc_lon),
    lonToHouseCusp(2, h2),
    lonToHouseCusp(3, h3),
    lonToHouseCusp(4, ic),
    lonToHouseCusp(5, h5),
    lonToHouseCusp(6, h6),
    lonToHouseCusp(7, dsc),
    lonToHouseCusp(8, h8),
    lonToHouseCusp(9, h9),
    lonToHouseCusp(10, mc_lon),
    lonToHouseCusp(11, h11),
    lonToHouseCusp(12, h12),
  ]

  return {
    cusps,
    ascendant: lonToHouseCusp(1, asc_lon),
    midheaven: lonToHouseCusp(10, mc_lon),
    ramc
  }
}

// Which house does an ecliptic longitude fall in?
export function whichHouse(lon: number, cusps: HouseCusp[]): number {
  const sorted = [...cusps].sort((a, b) => a.house - b.house)
  for (let i = 0; i < 12; i++) {
    const start = sorted[i].longitude
    const end   = sorted[(i + 1) % 12].longitude
    const lon_n = norm360(lon)
    if (start <= end) {
      if (lon_n >= start && lon_n < end) return sorted[i].house
    } else {
      // Wraps around 0°
      if (lon_n >= start || lon_n < end) return sorted[i].house
    }
  }
  return 1 // fallback
}
