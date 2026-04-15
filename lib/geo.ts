// Haversine-Distanzberechnung und Einzugsgebiet-Validierung

export const MOSBACH = { lat: 49.3504, lon: 9.136 }
export const MAX_RADIUS_KM = 50

/** Luftlinienabstand in km zwischen zwei WGS-84-Koordinaten */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Städte/Orte im und um den 50-km-Umkreis von Mosbach
// Koordinaten: WGS-84 (Ortsmittelpunkt)
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  mosbach: { lat: 49.3504, lon: 9.136 },
  'mosbach-neckarelz': { lat: 49.3558, lon: 9.1561 },
  waldbrunn: { lat: 49.3884, lon: 9.1127 },
  obrigheim: { lat: 49.3552, lon: 9.0789 },
  binau: { lat: 49.388, lon: 9.1078 },
  schefflenz: { lat: 49.3846, lon: 9.2528 },
  neunkirchen: { lat: 49.3432, lon: 9.2381 },
  neckarzimmern: { lat: 49.3056, lon: 9.1669 },
  haßmersheim: { lat: 49.2697, lon: 9.1576 },
  hassmersheim: { lat: 49.2697, lon: 9.1576 },
  gundelsheim: { lat: 49.2875, lon: 9.1508 },
  'bad rappenau': { lat: 49.2376, lon: 9.101 },
  'bad wimpfen': { lat: 49.2326, lon: 9.1667 },
  neudenau: { lat: 49.2776, lon: 9.2667 },
  möckmühl: { lat: 49.314, lon: 9.3642 },
  mockmühl: { lat: 49.314, lon: 9.3642 },
  elztal: { lat: 49.435, lon: 9.2234 },
  adelsheim: { lat: 49.398, lon: 9.3812 },
  aglasterhausen: { lat: 49.2974, lon: 9.0155 },
  sinsheim: { lat: 49.2527, lon: 8.8787 },
  eppingen: { lat: 49.1368, lon: 9.003 },
  heilbronn: { lat: 49.1427, lon: 9.219 },
  neckarsulm: { lat: 49.1912, lon: 9.2257 },
  weinsberg: { lat: 49.1545, lon: 9.2953 },
  öhringen: { lat: 49.2, lon: 9.5125 },
  ohringen: { lat: 49.2, lon: 9.5125 },
  schöntal: { lat: 49.3603, lon: 9.5292 },
  schontal: { lat: 49.3603, lon: 9.5292 },
  boxberg: { lat: 49.4745, lon: 9.6419 },
  buchen: { lat: 49.5222, lon: 9.3223 },
  walldürn: { lat: 49.5878, lon: 9.3746 },
  walldurn: { lat: 49.5878, lon: 9.3746 },
  hardheim: { lat: 49.6131, lon: 9.4686 },
  limbach: { lat: 49.4572, lon: 9.3361 },
  osterburken: { lat: 49.4311, lon: 9.4258 },
  eberbach: { lat: 49.4622, lon: 8.9844 },
  zwingenberg: { lat: 49.4002, lon: 8.9778 },
  neckargemünd: { lat: 49.3944, lon: 8.7987 },
  neckargemund: { lat: 49.3944, lon: 8.7987 },
  wilhelmsfeld: { lat: 49.384, lon: 8.8657 },
  heidelberg: { lat: 49.4093, lon: 8.6941 },
  kirchardt: { lat: 49.184, lon: 9.0266 },
  kraichtal: { lat: 49.1, lon: 8.7167 },
  bretten: { lat: 49.0368, lon: 8.7069 },
  tauberbischofsheim: { lat: 49.6232, lon: 9.6611 },
  wertheim: { lat: 49.7586, lon: 9.5085 },
  amorbach: { lat: 49.648, lon: 9.2236 },
  miltenberg: { lat: 49.7047, lon: 9.2635 },
}

export type CityValidationResult =
  | { valid: true; distanceKm: number }
  | { valid: false; distanceKm: number; reason: 'too_far' }
  | { valid: false; distanceKm: null; reason: 'not_found' }

/** Prüft ob ein Ortsname im 50-km-Einzugsgebiet liegt */
export function validateCity(input: string): CityValidationResult {
  const key = input.trim().toLowerCase()
  const coords = CITY_COORDS[key]

  if (!coords) {
    return { valid: false, distanceKm: null, reason: 'not_found' }
  }

  const dist = Math.round(haversineKm(MOSBACH.lat, MOSBACH.lon, coords.lat, coords.lon))

  if (dist > MAX_RADIUS_KM) {
    return { valid: false, distanceKm: dist, reason: 'too_far' }
  }

  return { valid: true, distanceKm: dist }
}
