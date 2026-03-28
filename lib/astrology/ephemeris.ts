// Planetary positions using Keplerian elements (JPL, accurate ~1° for 1800-2050)
// Sun: Meeus Ch.25 (~0.01°), Moon: Meeus Ch.47 simplified (~0.2°)

import {
  RAD, DEG, norm360, julianCenturies,
  keplerSolve, trueAnomaly
} from './math'

export interface BodyPosition {
  lon: number   // ecliptic longitude 0-360
  lat: number   // ecliptic latitude
  distance?: number
  speed?: number  // approximate daily motion in longitude
}

// ─── Sun (Meeus Ch. 25) ──────────────────────────────────────────────────────

export function sunPosition(jd: number): BodyPosition {
  const T = julianCenturies(jd)
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T)
  const Mdeg = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T)
  const M = Mdeg * RAD
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M)
  const Om = norm360(125.04 - 1934.136 * T)
  const apparent = norm360(L0 + C - 0.00569 - 0.00478 * Math.sin(Om * RAD))

  const T1 = julianCenturies(jd + 1)
  const L01 = norm360(280.46646 + 36000.76983 * T1 + 0.0003032 * T1 * T1)
  const M1 = norm360(357.52911 + 35999.05029 * T1 - 0.0001537 * T1 * T1)
  const C1 = (1.914602 - 0.004817 * T1) * Math.sin(M1 * RAD)
    + 0.019993 * Math.sin(2 * M1 * RAD)
  const lon1 = norm360(L01 + C1 - 0.00569)
  let speed = lon1 - apparent
  if (speed < -180) speed += 360
  if (speed > 180) speed -= 360

  return { lon: apparent, lat: 0, distance: 1, speed }
}

// ─── Moon (Meeus Ch. 47, main terms, ~0.2° accuracy) ────────────────────────

export function moonPosition(jd: number): BodyPosition {
  const T = julianCenturies(jd)
  const Lp = norm360(218.3165 + 481267.8813 * T)
  const D  = norm360(297.8502 + 445267.1115 * T)
  const M  = norm360(357.5291 + 35999.0503  * T)
  const Mp = norm360(134.9634 + 477198.8676 * T)
  const F  = norm360(93.2721  + 483202.0175 * T)
  const Om = norm360(125.0445 - 1934.1363   * T)

  function s(a: number) { return Math.sin(a * RAD) }

  const Sl = 0
    + 6288774 * s(Mp)
    + 1274027 * s(2*D - Mp)
    +  658314 * s(2*D)
    +  213618 * s(2*Mp)
    -  185116 * s(M)
    -  114332 * s(2*F)
    +   58793 * s(2*D - 2*Mp)
    +   57066 * s(2*D - M - Mp)
    +   53322 * s(2*D + Mp)
    +   45758 * s(2*D - M)
    -   40923 * s(M - Mp)
    -   34720 * s(D)
    -   30383 * s(M + Mp)
    +   15327 * s(2*D - 2*F)
    -   12528 * s(Mp + 2*F)
    +   10980 * s(Mp - 2*F)
    +   10675 * s(4*D - Mp)
    +   10034 * s(3*Mp)
    +    8548 * s(4*D - 2*Mp)
    -    7888 * s(2*D + M - Mp)
    -    6766 * s(2*D + M)
    -    5163 * s(D - Mp)
    +    4987 * s(D + M)
    +    4036 * s(2*D - M + Mp)
    +    3994 * s(2*D + 2*Mp)
    +    3861 * s(4*D)
    +    3665 * s(2*D - 3*Mp)
    -    2689 * s(M - 2*Mp)
    +    2236 * s(2*D - 2*M)
    -    2120 * s(M + 2*Mp)
    +    2048 * s(2*D - 2*M - Mp)

  const dPsi = -17.2 * s(Om) - 1.32 * s(2*Lp) + 0.21 * s(2*Om)
  const lon = norm360(Lp + Sl / 1000000 + dPsi / 3600)

  const T1 = julianCenturies(jd + 1)
  const Lp1 = norm360(218.3165 + 481267.8813 * T1)
  const D1  = norm360(297.8502 + 445267.1115 * T1)
  const M1  = norm360(357.5291 + 35999.0503  * T1)
  const Mp1 = norm360(134.9634 + 477198.8676 * T1)
  const Sl1 = 6288774*s(Mp1) + 1274027*s(2*D1-Mp1) + 658314*s(2*D1)
    + 213618*s(2*Mp1) - 185116*s(M1)
  const lon1 = norm360(Lp1 + Sl1 / 1000000)
  let speed = lon1 - lon
  if (speed < -180) speed += 360
  if (speed > 180) speed -= 360

  const Sb = 5128122 * s(F)
    + 280602 * s(Mp + F) + 277693 * s(Mp - F)
    + 173237 * s(2*D - F)
    +  55413 * s(2*D - Mp + F) + 46271 * s(2*D - Mp - F)
    +  32573 * s(2*D + F) + 17198 * s(2*Mp + F)
  const lat = Sb / 1000000

  return { lon, lat, speed }
}

// ─── Planets (JPL Keplerian elements, Table 1, 1800-2050) ───────────────────

interface OrbitalElements {
  a:   number; da:  number  // semi-major axis (AU) and rate
  e:   number; de:  number  // eccentricity and rate
  I:   number; dI:  number  // inclination (deg) and rate
  L:   number; dL:  number  // mean longitude (deg) and rate
  wp:  number; dwp: number  // longitude of perihelion (deg) and rate
  Om:  number; dOm: number  // longitude of ascending node (deg) and rate
  // Extra terms for Jupiter-Neptune
  b?: number; c?: number; f?: number; s?: number
}

const PLANET_ELEMENTS: Record<string, OrbitalElements> = {
  mercury: {
    a:0.38709927, da:0.00000037,
    e:0.20563593, de:0.00001906,
    I:7.00497902, dI:-0.00594749,
    L:252.25032350, dL:149472.67411175,
    wp:77.45779628, dwp:0.16047689,
    Om:48.33076593, dOm:-0.12534081
  },
  venus: {
    a:0.72333566, da:0.00000390,
    e:0.00677672, de:-0.00004107,
    I:3.39467605, dI:-0.00078890,
    L:181.97909950, dL:58517.81538729,
    wp:131.60246718, dwp:0.00268329,
    Om:76.67984255, dOm:-0.27769418
  },
  mars: {
    a:1.52371034, da:0.00001847,
    e:0.09339410, de:0.00007882,
    I:1.84969142, dI:-0.00813131,
    L:-4.55343205, dL:19140.30268499,
    wp:-23.94362959, dwp:0.44441088,
    Om:49.55953891, dOm:-0.29257343
  },
  jupiter: {
    a:5.20288700, da:-0.00011607,
    e:0.04838624, de:-0.00013253,
    I:1.30439695, dI:-0.00183714,
    L:34.39644051, dL:3034.74612775,
    wp:14.72847983, dwp:0.21252668,
    Om:100.47390909, dOm:0.20469106,
    b:-0.00012452, c:0.06064060, f:38.35125, s:-0.35635516
  },
  saturn: {
    a:9.53667594, da:-0.00125060,
    e:0.05386179, de:-0.00050991,
    I:2.48599187, dI:0.00193609,
    L:49.95424423, dL:1222.49362201,
    wp:92.59887831, dwp:-0.41897216,
    Om:113.66242448, dOm:-0.28867794,
    b:0.00025899, c:-0.13434469, f:38.35125, s:0.87320147
  },
  uranus: {
    a:19.18916464, da:-0.00196176,
    e:0.04725744, de:-0.00004397,
    I:0.77263783, dI:-0.00242939,
    L:313.23810451, dL:428.48202785,
    wp:170.95427630, dwp:0.40805281,
    Om:74.01692503, dOm:0.04240589,
    b:0.00058331, c:-0.97731848, f:7.67025, s:0.17689245
  },
  neptune: {
    a:30.06992276, da:0.00026291,
    e:0.00859048, de:0.00005105,
    I:1.77004347, dI:0.00035372,
    L:-55.12002969, dL:218.45945325,
    wp:44.96476227, dwp:-0.32241464,
    Om:131.78422574, dOm:-0.00508664,
    b:0.00068646, c:-0.09765203, f:7.67025, s:0.18830697
  }
}

const EARTH_ELEMENTS: OrbitalElements = {
  a:1.00000261, da:0.00000562,
  e:0.01671123, de:-0.00004392,
  I:-0.00001531, dI:-0.01294668,
  L:100.46457166, dL:35999.37244981,
  wp:102.93768193, dwp:0.32327364,
  Om:0.0, dOm:0.0
}

function getHeliocentricXYZ(el: OrbitalElements, T: number): [number, number, number] {
  const a  = el.a  + el.da  * T
  const e  = el.e  + el.de  * T
  const I  = (el.I  + el.dI  * T) * RAD
  const L  = norm360(el.L  + el.dL  * T)
  const wp = norm360(el.wp + el.dwp * T)
  const Om = norm360(el.Om + el.dOm * T)

  let M = norm360(L - wp)

  if (el.b !== undefined && el.c !== undefined && el.f !== undefined && el.s !== undefined) {
    M = norm360(M + el.b * T * T + el.c * Math.cos(el.f * T * RAD) + el.s * Math.sin(el.f * T * RAD))
  }

  const E = keplerSolve(M, e)
  const v = trueAnomaly(E, e)
  const r = a * (1 - e * Math.cos(E))
  const omega = (wp - Om) * RAD
  const Omega = Om * RAD

  const x = r * (Math.cos(Omega) * Math.cos(omega + v) - Math.sin(Omega) * Math.sin(omega + v) * Math.cos(I))
  const y = r * (Math.sin(Omega) * Math.cos(omega + v) + Math.cos(Omega) * Math.sin(omega + v) * Math.cos(I))
  const z = r * (Math.sin(I) * Math.sin(omega + v))

  return [x, y, z]
}

export function planetPosition(name: string, jd: number): BodyPosition {
  const T = julianCenturies(jd)
  const el = PLANET_ELEMENTS[name]
  if (!el) throw new Error(`Unknown planet: ${name}`)

  const [xp, yp, zp] = getHeliocentricXYZ(el, T)
  const [xe, ye, ze] = getHeliocentricXYZ(EARTH_ELEMENTS, T)

  const dx = xp - xe
  const dy = yp - ye
  const dz = zp - ze

  const lon = norm360(Math.atan2(dy, dx) * DEG)
  const lat = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)) * DEG
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

  const T1 = julianCenturies(jd + 1)
  const [xp1, yp1] = getHeliocentricXYZ(el, T1)
  const [xe1, ye1] = getHeliocentricXYZ(EARTH_ELEMENTS, T1)
  const lon1 = norm360(Math.atan2(yp1 - ye1, xp1 - xe1) * DEG)
  let speed = lon1 - lon
  if (speed < -180) speed += 360
  if (speed > 180) speed -= 360

  return { lon, lat, distance, speed }
}

// ─── Pluto (mean motion approximation) ──────────────────────────────────────

export function plutoPosition(jd: number): BodyPosition {
  const T = julianCenturies(jd)
  // Pluto mean longitude J2000: ~238.96°, period 247.68 years
  const L = norm360(238.9508 + (360 / 247.68) * T * 100)
  return { lon: L, lat: 17.14, speed: 0.004 }
}

// ─── Lunar North Node ────────────────────────────────────────────────────────

export function northNodePosition(jd: number): BodyPosition {
  const T = julianCenturies(jd)
  const Om = norm360(
    125.0445479
    - 1934.1362608 * T
    + 0.0020754 * T * T
    + T * T * T / 467441
    - T * T * T * T / 60616000
  )
  return { lon: Om, lat: 0, speed: -0.053 }
}

// ─── Chiron (approximate) ────────────────────────────────────────────────────

export function chironPosition(jd: number): BodyPosition {
  const T = julianCenturies(jd)
  // Chiron orbital period ~50.42 years, mean longitude ~209° at J2000
  const L = norm360(209.0 + (360 / 50.42) * T * 100)
  return { lon: L, lat: 6.9, speed: 0.020 }
}
