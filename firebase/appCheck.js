import { getApp } from '@react-native-firebase/app';
import { ReactNativeFirebaseAppCheckProvider, initializeAppCheck } from '@react-native-firebase/app-check';

let initialized = false;

// Must run once, before the first Firestore/Auth call (imported at the top of App.js).
// Failures are logged and swallowed: the app keeps running, Firestore reads will then be
// rejected by the backend if App Check enforcement is on.
export function setupAppCheck() {
  if (initialized) return;
  initialized = true;

  try {
    const debugToken = process.env.EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN;

    const provider = new ReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: {
        provider: __DEV__ ? 'debug' : 'playIntegrity',
        ...(__DEV__ && debugToken ? { debugToken } : {}),
      },
      apple: {
        provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
        ...(__DEV__ && debugToken ? { debugToken } : {}),
      },
    });

    initializeAppCheck(getApp(), { provider, isTokenAutoRefreshEnabled: true });
  } catch (error) {
    console.warn('[AppCheck] initialization failed:', error);
  }
}

setupAppCheck();
