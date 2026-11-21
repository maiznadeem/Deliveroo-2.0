import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, getIdToken } from '@react-native-firebase/auth';
import { getToken } from '@react-native-firebase/app-check';
import { appCheckInstance } from '../firebase/appCheck';

// Firebase Storage only serves signed-in users (and, once enforced, App Check). Every StorageImage needs the
// same two headers, so they are fetched once here and shared. Both SDKs cache their tokens; this module
// re-reads them when the signed-in user changes or the headers are older than REFRESH_MS.
const REFRESH_MS = 10 * 60 * 1000;

let state = { status: 'loading', headers: null, loadedAt: 0 }; // status: loading | ready | signedOut
let inflight = null;
let authListenerStarted = false;
const listeners = new Set();

function publish(next) {
  state = next;
  listeners.forEach((listener) => listener(state));
}

async function loadHeaders(user) {
  // Both tokens are independent network/cache lookups: fetch them together. App Check may be unavailable
  // (e.g. a device without Play Integrity): then only the ID token is sent and the request is rejected by
  // the backend if enforcement is on.
  const [idToken, appCheckToken] = await Promise.all([
    getIdToken(user),
    appCheckInstance
      ? getToken(appCheckInstance).then(({ token }) => token).catch((error) => {
          console.log('[StorageImage] App Check token unavailable, sending only the ID token:', error?.message ?? error);
          return null;
        })
      : null,
  ]);
  const headers = { Authorization: `Firebase ${idToken}` };
  if (appCheckToken) headers['X-Firebase-AppCheck'] = appCheckToken;
  return headers;
}

function refresh() {
  const user = getAuth().currentUser;
  if (!user) {
    publish({ status: 'signedOut', headers: null, loadedAt: 0 });
    return;
  }
  if (inflight) return;
  inflight = loadHeaders(user)
    .then((headers) => publish({ status: 'ready', headers, loadedAt: Date.now() }))
    .catch((error) => {
      console.warn('[StorageImage] could not get an ID token:', error);
      publish({ status: 'signedOut', headers: null, loadedAt: 0 });
    })
    .finally(() => {
      inflight = null;
    });
}

function ensureAuthListener() {
  if (authListenerStarted) return;
  authListenerStarted = true;
  onAuthStateChanged(getAuth(), () => {
    publish({ status: 'loading', headers: null, loadedAt: 0 });
    refresh();
  });
}

// Starts fetching the headers right away (called once at startup), so they are usually ready by the time the first
// image is rendered.
export function prewarmStorageHeaders() {
  ensureAuthListener();
  refresh();
}

// Called by StorageImage when a load fails (e.g. an ID token that expired while the app sat idle):
// fetch fresh headers so the image can retry once with them.
export function refreshStorageHeaders() {
  refresh();
}

// Returns { status, headers }. Pass enabled=false to skip all work (non-Storage images).
export default function useStorageAuthHeaders(enabled = true) {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => {
    if (!enabled) return undefined;
    ensureAuthListener();
    listeners.add(setSnapshot);
    setSnapshot(state);
    if (state.status === 'ready' && Date.now() - state.loadedAt > REFRESH_MS) refresh();
    return () => {
      listeners.delete(setSnapshot);
    };
  }, [enabled]);

  return snapshot;
}
