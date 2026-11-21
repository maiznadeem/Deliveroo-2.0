import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const TIMEOUT_MS = 10000;

// Decodes a Google encoded polyline into [{ latitude, longitude }, ...].
export function decodePolyline(polyline) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < polyline.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

// Driving route between two { latitude, longitude } points through the Google Routes API.
// Never throws: when the key is missing or the request fails it returns a straight line instead.
export async function getRouteCoordinates(origin, destination) {
  const straightLine = [origin, destination];

  const extra = Constants.expoConfig?.extra ?? {};
  const apiKey = extra.googleMapsAndroidApiKey;
  if (typeof apiKey !== 'string' || apiKey === '') return straightLine;

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'routes.polyline.encodedPolyline',
  };
  // An Android-restricted key is only accepted together with the app's package name and cert SHA-1.
  if (Platform.OS === 'android' && typeof extra.androidCertSha1 === 'string' && extra.androidCertSha1 !== '') {
    headers['X-Android-Package'] = Constants.expoConfig?.android?.package;
    headers['X-Android-Cert'] = String(extra.androidCertSha1).replace(/:/g, '').toUpperCase();
  }

  const toWaypoint = ({ latitude, longitude }) => ({ location: { latLng: { latitude, longitude } } });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(ROUTES_URL, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        origin: toWaypoint(origin),
        destination: toWaypoint(destination),
        travelMode: 'DRIVE',
      }),
    });
    if (!response.ok) {
      console.warn('Routes API request failed:', response.status);
      return straightLine;
    }
    const data = await response.json();
    const encoded = data?.routes?.[0]?.polyline?.encodedPolyline;
    if (!encoded) return straightLine;
    const decoded = decodePolyline(encoded);
    return decoded.length > 1 ? decoded : straightLine;
  } catch (error) {
    console.warn('Error fetching route:', error);
    return straightLine;
  } finally {
    clearTimeout(timer);
  }
}
