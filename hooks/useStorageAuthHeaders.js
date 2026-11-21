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
  const idToken = await getIdToken(user);
  const headers = { Authorization: `Firebase ${idToken}` };
  // Enforcement is off for now and App Check is unavailable on some emulators: never block images on it.
  if (appCheckInstance) {
    try {
      const { token } = await getToken(appCheckInstance);
      if (token) headers['X-Firebase-AppCheck'] = token;
    } catch (error) {
      console.log('[StorageImage] App Check token unavailable, sending only the ID token:', error?.message ?? error);
    }
  }
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
