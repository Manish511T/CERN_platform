export const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6_371_000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const getETAMinutes = (meters, speedKmh = 30) => {
  return Math.round((meters / 1000) / speedKmh * 60)
}

// MongoDB GeoJSON expects [longitude, latitude]
export const toGeoJSONPoint = (latitude, longitude) => ({
  type: 'Point',
  coordinates: [longitude, latitude],
})