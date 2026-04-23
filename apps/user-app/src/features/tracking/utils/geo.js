export const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R    = 6_371_000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const getETAMinutes = (meters, speedKmh = 30) => {
  return Math.max(1, Math.round((meters / 1000 / speedKmh) * 60))
}

export const formatDistance = (meters) => {
  if (meters == null || isNaN(meters)) return '—'
  return meters < 1000
    ? `${meters}m`
    : `${(meters / 1000).toFixed(1)}km`
}