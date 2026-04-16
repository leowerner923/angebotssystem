export const MOSBACH = { lat: 49.3504, lon: 9.136 }
export const MAX_RADIUS_KM = 50

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

export type CityValidationResult =
  | { valid: true; distanceKm: number; city: string }
  | { valid: false; distanceKm: number; reason: 'too_far'; city: string }
  | { valid: false; distanceKm: null; reason: 'not_found' }

export async function validatePlz(plz: string): Promise<CityValidationResult> {
  try {
    const res = await fetch(`https://api.zippopotam.us/de/${plz.trim()}`)

    if (!res.ok) {
      return { valid: false, distanceKm: null, reason: 'not_found' }
    }

    const data = await res.json()
    const place = data.places?.[0]

    if (!place) {
      return { valid: false, distanceKm: null, reason: 'not_found' }
    }

    const lat = parseFloat(place.latitude)
    const lon = parseFloat(place.longitude)
    const city = place['place name']

    const dist = Math.round(haversineKm(MOSBACH.lat, MOSBACH.lon, lat, lon))

    if (dist > MAX_RADIUS_KM) {
      return { valid: false, distanceKm: dist, reason: 'too_far', city }
    }

    return { valid: true, distanceKm: dist, city }

  } catch {
    return { valid: false, distanceKm: null, reason: 'not_found' }
  }
}

// Alte Funktion bleibt für Kompatibilität
export function validateCity(input: string): { valid: false; distanceKm: null; reason: 'not_found' } {
  return { valid: false, distanceKm: null, reason: 'not_found' }
}