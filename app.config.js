const { version } = require('./package.json');

const APP_ID = 'com.himaiz.deliveroo';

// versionCode = major * 10000 + minor * 100 + patch (e.g. 2.0.0 -> 20000, 2.13.4 -> 21304).
// It is derived, never edited by hand, so it always increases with the version.
function androidVersionCode(semver) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(semver);
  if (!match) {
    throw new Error(`package.json version "${semver}" is not a valid semver (expected MAJOR.MINOR.PATCH).`);
  }
  const [major, minor, patch] = match.slice(1).map(Number);
  if (minor >= 100 || patch >= 100) {
    throw new Error(
      `package.json version "${semver}": minor and patch must be below 100 to derive android.versionCode ` +
        '(major*10000 + minor*100 + patch).'
    );
  }
  return major * 10000 + minor * 100 + patch;
}

module.exports = {
  expo: {
    name: 'Deliveroo',
    slug: 'deliveroo',
    version,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
      bundleIdentifier: APP_ID,
      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || './GoogleService-Info.plist',
    },
    android: {
      package: APP_ID,
      versionCode: androidVersionCode(version),
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    plugins: [
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      '@react-native-firebase/app-check',
      [
        'expo-build-properties',
        {
          ios: { useFrameworks: 'dynamic' },
          // React Native Firebase 27 pulls Firebase BoM 35 (firebase-auth 25), which ships Kotlin 2.4
          // metadata; Expo SDK 58's default Kotlin 2.2 can't read it. See the RNFB v27 migration guide.
          android: {
            kotlinVersion: '2.4.0',
            // react-native-maps pulls WorkManager 2.9 (Room 2.5), which creates WorkDatabase_Impl by
            // reflection. AGP 9's full-mode R8 strips its no-arg constructor and the app crashes on launch.
            extraProguardRules: '-keep class * extends androidx.room.RoomDatabase { <init>(); }',
          },
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          imageWidth: 200,
        },
      ],
      // Only written into the manifest when the env var is set at prebuild time.
      ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }],
      './plugins/withAndroidReleaseSigning',
    ],
    extra: {
      // Read at runtime through expo-constants (screens/DeliveryScreen.js -> helpers/directions.js).
      googleMapsAndroidApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY || undefined,
      androidCertSha1: process.env.ANDROID_CERT_SHA1 || undefined,
      eas: {
        projectId: 'b409764c-993f-40df-a553-20a72d2f93f2',
      },
    },
    owner: 'maiz-nadeem',
  },
};
