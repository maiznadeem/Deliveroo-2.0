import { getApp } from '@react-native-firebase/app';
import { ReactNativeFirebaseAppCheckProvider, initializeAppCheck } from '@react-native-firebase/app-check';

let initialized = false;

// The App Check instance, for callers that need a token (see hooks/useStorageAuthHeaders.js).
// Stays null if initialization failed.
export let appCheckInstance = null;

// Release builds use Play Integrity, which an emulator cannot pass. For QA runs of a release-mode build
// (e.g. startup measurements on the emulator) a build-time switch selects the debug provider instead:
//   EXPO_PUBLIC_DELIVEROO_QA_APPCHECK_DEBUG=1 and EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN=<registered debug token>
// Both are inlined into the JS bundle at build time (only EXPO_PUBLIC_* variables are). A QA build must never
// be published: scripts/release-android.mjs refuses to run while either variable is set.
const debugToken = process.env.EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN;
const qaDebug = process.env.EXPO_PUBLIC_DELIVEROO_QA_APPCHECK_DEBUG === '1' && !!debugToken;
const useDebugProvider = __DEV__ || qaDebug;

// Must run once, before the first Firestore/Auth call (imported at the top of App.js).
// Failures are logged and swallowed: the app keeps running, Firestore reads will then be
// rejected by the backend if App Check enforcement is on.
export function setupAppCheck() {
  if (initialized) return;
  initialized = true;

  try {
    const tokenOption = useDebugProvider && debugToken ? { debugToken } : {};

    const provider = new ReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: {
        provider: useDebugProvider ? 'debug' : 'playIntegrity',
        ...tokenOption,
      },
      apple: {
        provider: useDebugProvider ? 'debug' : 'appAttestWithDeviceCheckFallback',
        ...tokenOption,
      },
    });

    appCheckInstance = initializeAppCheck(getApp(), { provider, isTokenAutoRefreshEnabled: true });
    if (qaDebug && !__DEV__) console.warn('[AppCheck] QA build: using the debug provider. Never publish this build.');
  } catch (error) {
    console.warn('[AppCheck] initialization failed:', error);
  }
}

setupAppCheck();
