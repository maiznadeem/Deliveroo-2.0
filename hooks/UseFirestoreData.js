import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from '@react-native-firebase/firestore';

// Reads a whole collection once. Returns { data, loading, error } so callers can show something
// other than an endless spinner when the read fails (e.g. Firestore rules answer permission-denied).
const useFirestoreData = (collectionName) => {
  const [state, setState] = useState({ data: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: [], loading: true, error: null });

    getDocs(collection(getFirestore(), collectionName))
      .then((snapshot) => {
        if (cancelled) return;
        setState({ data: snapshot.docs.map((doc) => doc.data()), loading: false, error: null });
      })
      .catch((error) => {
        console.log(`Error fetching "${collectionName}" from Firestore:`, error);
        if (cancelled) return;
        setState({ data: [], loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [collectionName]);

  return state;
};

export default useFirestoreData;
