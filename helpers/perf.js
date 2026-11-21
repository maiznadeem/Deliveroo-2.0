// Startup timing marks, logged to logcat as "[perf] <name>" (adb logcat -s ReactNativeJS).
// Only active in the QA build switch (see firebase/appCheck.js), so production builds log nothing.
const enabled = process.env.EXPO_PUBLIC_DELIVEROO_QA_APPCHECK_DEBUG === '1';
const seen = new Set();

export function perfMark(name) {
  if (!enabled || seen.has(name)) return;
  seen.add(name);
  console.log(`[perf] ${name}`);
}
