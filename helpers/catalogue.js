import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { collection, getDoc, getDocs, getDocsFromCache, getFirestore } from '@react-native-firebase/firestore';
import { toLatLng } from './geo';

// The catalogue (Categories, Featured, Restaurant, Dish) is small and read-only, so it is read as whole collections:
//   * the three dashboard collections are read in parallel, once, and shared by every component (no N+1 getDoc
//     per featured restaurant: Featured only holds references, which are resolved from the Restaurant read);
//   * the Firestore persistent cache is read first, so a returning user sees the dashboard immediately, and the
//     server read then refreshes it;
//   * dish documents are memoised by path and prefetched with one collection read, so opening a restaurant never
//     waits on per-dish reads.

const initialState = { categories: [], sections: [], loading: true, error: null };
let state = initialState;
let started = false;
let serverLoaded = false;
let currentUid = null;
const listeners = new Set();

function publish(next) {
  state = next;
  listeners.forEach((listener) => listener(state));
}

const withLatLng = (restaurant) => ({ ...restaurant, location: toLatLng(restaurant.location) });

// Dish documents by path. A rejected read is dropped so it can be retried.
const dishes = new Map();

function readRef(ref, normalize) {
  let pending = dishes.get(ref.path);
  if (!pending) {
    pending = getDoc(ref).then((snapshot) => (snapshot.exists() ? normalize(snapshot.data()) : null));
    pending.catch(() => dishes.delete(ref.path));
    dishes.set(ref.path, pending);
  }
  return pending;
}

async function readCatalogue(read) {
  const db = getFirestore();
  const [categoriesSnap, featuredSnap, restaurantsSnap] = await Promise.all([
    read(collection(db, 'Categories')),
    read(collection(db, 'Featured')),
    read(collection(db, 'Restaurant')),
  ]);

  const restaurants = new Map(restaurantsSnap.docs.map((snap) => [snap.ref.path, withLatLng(snap.data())]));
  const sections = await Promise.all(
    featuredSnap.docs.map(async (snap) => {
      const featured = snap.data();
      const resolved = await Promise.all(
        (featured.restaurant ?? []).map((ref) =>
          restaurants.has(ref.path) ? restaurants.get(ref.path) : readRef(ref, withLatLng).catch(() => null)
        )
      );
      return {
        id: featured.id,
        title: featured.title,
        description: featured.description,
        restaurants: resolved.filter(Boolean),
      };
    })
  );

  return { categories: categoriesSnap.docs.map((snap) => snap.data()), sections };
}

function start() {
  if (started) return;
  started = true;
  serverLoaded = false;

  readCatalogue(getDocsFromCache)
    .then((cached) => {
      if (!serverLoaded && cached.categories.length > 0 && cached.sections.length > 0) {
        publish({ ...cached, loading: false, error: null });
      }
    })
    .catch(() => {}); // nothing cached yet: wait for the server read

  readCatalogue(getDocs)
    .then((fresh) => {
      serverLoaded = true;
      publish({ ...fresh, loading: false, error: null });
    })
    .catch((error) => {
      console.log('Error fetching the catalogue from Firestore:', error);
      // keep showing cached content if there is any
      publish({ ...state, loading: false, error: state.categories.length > 0 ? null : error });
    });
}

let watching = false;

function ensureUserWatch() {
  if (watching) return;
  watching = true;
  watchUser();
}

// Starts reading right away for a user who is already signed in (called once at startup, in parallel with the
// JS bundle finishing its setup), so the data is usually there by the time the Dashboard mounts.
export function preloadCatalogue() {
  const user = getAuth().currentUser;
  if (!user) return;
  ensureUserWatch();
  currentUid = user.uid;
  start();
}

// A different user (sign-out, demo account deleted, new sign-in) gets a fresh read.
function watchUser() {
  onAuthStateChanged(getAuth(), (user) => {
    const uid = user?.uid ?? null;
    if (uid === currentUid) return;
    currentUid = uid;
    started = false;
    state = initialState;
    if (listeners.size > 0 && uid) start();
  });
}
// { categories, sections: [{ id, title, description, restaurants }], loading, error }
export function useCatalogue() {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => {
    ensureUserWatch();
    listeners.add(setSnapshot);
    setSnapshot(state);
    start();
    return () => {
      listeners.delete(setSnapshot);
    };
  }, []);

  return snapshot;
}

// Dish documents for a restaurant's references: memoised, read in parallel. Missing/failed dishes become null.
export function loadDishes(refs) {
  return Promise.all(
    (refs ?? []).map((ref) =>
      readRef(ref, (data) => data).catch((error) => {
        console.log('Error getting dish:', error);
        return null;
      })
    )
  );
}

// One collection read fills the dish memo, so the first restaurant opened doesn't need per-dish reads.
export function prefetchDishes() {
  return getDocs(collection(getFirestore(), 'Dish'))
    .then((snapshot) => snapshot.docs.forEach((snap) => {
      if (!dishes.has(snap.ref.path)) dishes.set(snap.ref.path, Promise.resolve(snap.data()));
    }))
    .catch(() => {});
}
