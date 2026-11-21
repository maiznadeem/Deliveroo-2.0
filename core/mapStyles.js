// Google Maps "night" style (Android). Passed as customMapStyle when the app is in dark mode.
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2427' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a979d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2427' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3a4549' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#232d31' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#7d8a90' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2f2c' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2e393d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1d2427' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a4aa' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3b4a4f' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#232d31' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1a1e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#55656b' }] },
];
