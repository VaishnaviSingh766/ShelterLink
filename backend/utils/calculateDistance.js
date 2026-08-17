// Calculates the distance in kilometers between two lat/lng points using the Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;

  // Convert the difference in latitude and longitude from degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  // The Haversine formula itself
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = earthRadiusKm * c;

  return distanceKm;
}

// Helper function: converts degrees to radians (trigonometry functions need radians, not degrees)
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export default calculateDistance;