import * as SplashScreen from 'expo-splash-screen';
import { perfMark } from './perf';

// The native splash stays up until the first screen has something to show: the Start screen once laid out, or
// the Dashboard once its content (cached or fresh) is ready. App.js also hides it after a timeout, so a stuck
// load can never leave the app behind the splash.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 200, fade: true });

let hidden = false;

export function hideSplash() {
  if (hidden) return;
  hidden = true;
  perfMark('splash-hidden');
  SplashScreen.hideAsync().catch(() => {});
}
