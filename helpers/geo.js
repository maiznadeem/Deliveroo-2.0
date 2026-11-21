// Firestore GeoPoint -> plain { latitude, longitude }, so it can live in Redux / navigation params.
export function toLatLng(geopoint) {
  if (!geopoint) return null;
  const latitude = geopoint.latitude ?? geopoint._latitude ?? geopoint._lat;
  const longitude = geopoint.longitude ?? geopoint._longitude ?? geopoint._long;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  return { latitude, longitude };
}
