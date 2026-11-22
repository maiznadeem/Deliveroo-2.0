# Infrastructure and deployment

This page records how Deliveroo 2.0 is hosted, built, released and protected. It was checked against the live setup on 2026-11-22. It names secrets and keys but never contains their values.

Deliveroo is a **Firebase-only Android app**. There is no server of its own: the app talks directly to Google endpoints (Firebase and Google Maps Platform).

## Hosting: Firebase project

| | |
| --- | --- |
| Project | `deliveroo-2-c6550` (project number 40768926344) |
| Owner | the maintainer's Google account (IAM `roles/owner`) |
| Plan | Blaze (pay as you go), kept at $0 by the limits below |
| Android app | `com.himaiz.deliveroo`; its `google-services.json` comes from the Firebase console and is git-ignored |

Services in use:
- **Authentication:** email/password, and anonymous sign-in for the **Try the demo** button.
- **Cloud Firestore:** the default database, with collections `Restaurant`, `Dish`, `Categories` and `Featured`.
- **Cloud Storage for Firebase:** the default bucket `deliveroo-2-c6550.firebasestorage.app` in `US-CENTRAL1`, holding WebP catalogue images under `restaurants/`, `categories/` and `dishes/`.
- **App Check:** Play Integrity.
- **Google Maps Platform:** only the Maps SDK for Android and the Routes API are enabled; every other Maps API is disabled.

Not in use:
- **Cloud Functions:** none. The legacy `graphql` function from 2023 was deleted on 2026-11-22, along with its source bucket and Artifact Registry repository.
- **Firebase Hosting:** the default site `deliveroo-2-c6550.web.app` exists but has nothing deployed, so it returns 404. It is kept as is: it costs nothing, and a project's default site can't be deleted.
- **App Engine:** the default app exists only because of the old `appspot.com` bucket. It has no services and is kept as is: it costs nothing, it can't be deleted, and disabling App Engine on an older Firebase project can affect its Firestore database.
- **Realtime Database:** none.

## Cloudflare: not used, by design

Deliveroo is **not behind Cloudflare, on purpose.** It has no custom domain, and every endpoint the app calls is a Google endpoint that can't be proxied, such as `firestore.googleapis.com`, `firebasestorage.googleapis.com`, `identitytoolkit.googleapis.com` and `routes.googleapis.com`.

Instead, access is controlled at Google: App Check (bot protection), the security rules, restricted API keys and quotas. The sections below cover each.

## Mobile builds

- **Local builds only.** Release APKs are built on the maintainer's machine with Expo prebuild (CNG) and Gradle. `android/` and `ios/` are generated and never committed.
- **Toolchain:**
  - JDK 17
  - the Android SDK, with CMake 3.31 or newer on Windows
  - Kotlin 2.4.0, set in `app.config.js` through `expo-build-properties`
- **EAS isn't used.** `eas.json` and `extra.eas.projectId` are leftovers from 2023, and EAS Build and EAS Submit aren't part of the release process.
- **Distribution:** APKs are published only on [GitHub Releases](https://github.com/MaizNadeem/Deliveroo-2.0/releases). There's no Play Store listing and no iOS build.
- **CPU types:** release builds contain `arm64-v8a` and `armeabi-v7a` only.
- **Signing:**
  - Release APKs are signed with the project's release key (certificate SHA-1 `E4:5F:A6:C7:E3:4D:04:5E:86:23:90:20:0E:A0:F9:8E:B5:54:3E:AB`).
  - `plugins/withAndroidReleaseSigning.js` fails the build if the signing environment variables are missing; it never falls back to the debug key.
  - **Losing the release key means users can't install updates**, so it is backed up in the maintainer's secret store (see below).

## CI

There is **no CI**: the repo has no `.github/workflows`, so pushes and pull requests trigger no automated checks.

Checks are run locally before every merge:
- `npx expo install --check`
- `npx expo-doctor`
- `npx expo export --platform android`
- a full release build, plus a run on a device or emulator

## CD

### App releases
1. Merge to `main`.
2. From a clean checkout of `main`, run `npm run release:android -- <version> [--publish]` (see [README → Releasing](../README.md#releasing-android)). The script:
   - bumps `package.json`
   - runs prebuild and `assembleRelease`
   - writes `dist/deliveroo-v<version>.apk` and its `.sha256`
   - commits and tags `v<version>`
   - with `--publish`, pushes and creates the GitHub release
3. The version comes only from `package.json`. `versionCode` = `major*10000 + minor*100 + patch`.
4. Users update by installing the newer APK over the old one, signed with the same key.

The script refuses to build a release if a QA switch (the App Check debug provider) or a debug token is set.

### Security rules and indexes
- The source of truth is the repo:
  - `firestore.rules`
  - `storage.rules`
  - `firestore.indexes.json`
  - `firebase.json`, which wires them up
  - `.firebaserc`, which pins the default project to `deliveroo-2-c6550`
- **Live matches the repo exactly** (checked on 2026-11-22). Both rule files compile with no issues through the Rules API, so a deploy would change nothing.
- **To deploy**, use the Firebase CLI, signed in as a project owner:
  ```bash
  firebase deploy --only firestore:rules,storage      # rules only
  firebase deploy --only firestore:indexes            # indexes
  firebase deploy --only firestore:rules --dry-run    # validate without releasing
  ```
  The Firebase console (Firestore → Rules, Storage → Rules) also works for one-off edits. Copy any change back into the files here.
- **Indexes:** none. Every query the app makes is a whole-collection read or a document lookup, so automatic single-field indexes are enough.
  - The legacy 2023 composite index on `Restaurant` (`genre`, `id`) wasn't used and was deleted on 2026-11-22.
  - `firestore.indexes.json` is therefore empty. Deploying indexes from it removes any composite index created by hand in the console.
- **Catalogue data and images:** they're edited with the Firebase console, gcloud, or the Firestore REST API with an owner's credentials. Clients can never write.

## Rollback

| Part | How to roll back |
| --- | --- |
| **App** | Install the previous APK from GitHub Releases. Android only allows installing a lower `versionCode` after uninstalling, so for a real fix ship a new patch version, e.g. `2.0.1`. Bad releases can be deleted or marked as pre-release on GitHub. |
| **Security rules / indexes** | Firebase console → Rules → history → roll back to a previous version. Or check out the files from an earlier git commit and run `firebase deploy --only firestore:rules,storage` (or `firestore:indexes`). |
| **App Check enforcement** | Firebase console → App Check → APIs → set Firestore, Storage or Authentication back to *Unenforced*. This takes effect within about 15 minutes. |
| **Storage objects** | Object versioning is off, but the bucket has a 7-day soft-delete window: deleted or overwritten objects can be restored with `gcloud storage restore` for 7 days. The originals from before the 2026 WebP migration are archived offline by the maintainer. The deleted `appspot.com` bucket was restorable only until about 2026-11-28. |
| **Firestore data** | Backups and point-in-time recovery are **off by choice**: both are billed and the project is kept at $0. Delete protection is also off. The database is in `nam5`. The catalogue is small and was seeded by hand, so it can be re-entered if lost. |
| **API keys** | Restrictions and enabled APIs can be changed back in Google Cloud console → APIs & Services. A deleted key can be restored for 30 days. |

## Secrets and keys (names and locations only)

**Kept on the maintainer's machine, in a DPAPI-encrypted local secret store:**
- `deliveroo-android-keystore-b64`: the release keystore, base64-encoded.
- `deliveroo-android-keystore-password`: the keystore and key password. The key alias is `deliveroo`.
- `deliveroo-maps-android-key`: the Google Maps key, injected as `GOOGLE_MAPS_ANDROID_API_KEY` at build time.
- `deliveroo-appcheck-debug-token`: the App Check debug token for development and QA builds on emulators.

**Build-time environment variables** (see `.env.example`):
- `DELIVEROO_KEYSTORE_PATH`, `DELIVEROO_KEYSTORE_PASSWORD`, `DELIVEROO_KEY_ALIAS`, `DELIVEROO_KEY_PASSWORD`
- `GOOGLE_MAPS_ANDROID_API_KEY`, `ANDROID_CERT_SHA1`
- `EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN`: dev builds only. The release script refuses to run while it's set.

**Config files:** `google-services.json`, from the Firebase console and git-ignored. It contains no secret, only the Firebase Android API key, which is restricted as described below.

**API keys** (Google Cloud → APIs & Services → Credentials):

| Key | Application restriction | API restriction |
| --- | --- | --- |
| Android key (auto created by Firebase) | Android apps: `com.himaiz.deliveroo` with the release SHA-1, plus the React Native template debug SHA-1 (`5E:8F:16:06:…:F6:25`) for development builds | the Firebase APIs set by Firebase |
| Deliveroo Android Maps | Android apps: `com.himaiz.deliveroo` with the release SHA-1 only | Maps SDK for Android, Routes API |

The old unrestricted browser key from the 2023 web app was deleted, and the web app was removed.

**Service accounts:** `firebase-adminsdk-k7y81` has **no user-managed keys**. Its two keys from 2023 were deleted on 2026-11-22, so only Google's own system-managed key remains. No downloadable admin credential exists.

**Cost guards:**
- **Routes API quota:** 300 requests a day, 30 a minute, 5 a minute per user. The free tier is 10,000 a month.
- **Maps SDK for Android** map loads are free.
- **Budget:** "Deliveroo - alert on any spend" ($1) emails the billing admins at 1%, 50% and 100%.

## Bot protection: App Check

- **Provider:**
  - Release builds use **Play Integrity**, configured for APKs distributed **outside Google Play**: unrecognized app versions are allowed, a Play licence isn't required, and the device must meet `MEETS_DEVICE_INTEGRITY`. Tokens last 6 hours.
  - Development builds use the **debug provider** with a registered debug token.
- **Enforcement is ON** for Cloud Firestore, Cloud Storage and Authentication (Identity Toolkit). Requests without a valid App Check token are rejected, even with a valid user token. This was checked on 2026-11-22.
- **Not covered by App Check:** Google Maps (the Maps SDK and Routes don't support it). They're protected by the restricted key and the quotas above.
- **Who fails App Check:** rooted phones and uncertified emulators.

## Data: security rules summary

- **Firestore** ([`firestore.rules`](../firestore.rules)): any signed-in user, including demo (anonymous) users, can read every document. Writes from clients are always denied.
- **Storage** ([`storage.rules`](../storage.rules)): signed-in users can read; writes are always denied. Objects have no public download tokens, so images can only be fetched with an ID token (`Authorization: Firebase <idToken>`) plus an App Check token. See `components/StorageImage.js`.
- **Demo accounts:** anonymous users are deleted when they sign out.
