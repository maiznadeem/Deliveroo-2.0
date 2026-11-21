#!/usr/bin/env node
// Builds a signed release APK and prepares (or publishes) a GitHub release.
//
//   npm run release:android -- <version> [--publish] [--rebuild]
//
// Without --publish everything stays local: the APK in dist/, a "Release v<version>" commit and an
// annotated tag. The exact publish commands are printed at the end.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const require = createRequire(import.meta.url);

const USAGE = 'Usage: npm run release:android -- <version> [--publish] [--rebuild]';
const SIGNING_ENV = ['DELIVEROO_KEYSTORE_PATH', 'DELIVEROO_KEYSTORE_PASSWORD', 'DELIVEROO_KEY_ALIAS', 'DELIVEROO_KEY_PASSWORD'];

// Undo steps registered once the script starts changing files, so a failed build never leaves a
// bumped package.json behind.
const rollbacks = [];

function fail(message) {
  console.error(`\nError: ${message}`);
  for (const rollback of rollbacks.splice(0).reverse()) {
    try {
      rollback();
    } catch (error) {
      console.error(`Rollback step failed: ${error.message}`);
    }
  }
  process.exit(1);
}

function run(command, args, { cwd = root, capture = false, shell = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    shell,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.error) fail(`could not run "${command}": ${result.error.message}`);
  if (result.status !== 0) {
    const detail = capture ? `\n${result.stdout ?? ''}${result.stderr ?? ''}`.trimEnd() : '';
    fail(`"${[command, ...args].join(' ')}" exited with code ${result.status}.${detail}`);
  }
  return capture ? result.stdout.trim() : '';
}

// npm/npx/gradlew.bat are .cmd/.bat shims on Windows and need a shell.
const runShell = (command, args, options = {}) => run(command, args, { ...options, shell: isWindows });
const git = (...args) => run('git', args, { capture: true });

// ---- 1. Arguments and version checks (nothing is touched yet) -------------------------------------

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((arg) => arg.startsWith('--')));
const positional = argv.filter((arg) => !arg.startsWith('--'));
const unknownFlags = [...flags].filter((flag) => !['--publish', '--rebuild'].includes(flag));
if (unknownFlags.length > 0) fail(`unknown option(s): ${unknownFlags.join(', ')}\n${USAGE}`);
if (positional.length !== 1) fail(`expected exactly one version argument.\n${USAGE}`);

const version = positional[0];
const publish = flags.has('--publish');
const rebuild = flags.has('--rebuild');

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const parse = (value) => SEMVER.exec(value)?.slice(1).map(Number);

const next = parse(version);
if (!next) fail(`"${version}" is not a valid MAJOR.MINOR.PATCH version (no "v" prefix, no pre-release suffix).`);
if (next[1] >= 100 || next[2] >= 100) {
  fail(`"${version}": minor and patch must be below 100 (android.versionCode = major*10000 + minor*100 + patch).`);
}

const packageJsonPath = join(root, 'package.json');
const currentVersion = JSON.parse(readFileSync(packageJsonPath, 'utf8')).version;
const current = parse(currentVersion);
if (!current) fail(`package.json version "${currentVersion}" is not MAJOR.MINOR.PATCH.`);

const compare = (a, b) => a.reduce((diff, part, i) => diff || part - b[i], 0);
const comparison = compare(next, current);
if (comparison < 0 || (comparison === 0 && !rebuild)) {
  fail(
    comparison === 0
      ? `version ${version} equals the current package.json version. Pass --rebuild to rebuild the same version.`
      : `version ${version} must be greater than the current package.json version ${currentVersion}.`
  );
}

const tag = `v${version}`;

// ---- 2. Repository and environment checks ----------------------------------------------------------

// A QA build (App Check debug provider, see firebase/appCheck.js) must never be published, and EXPO_PUBLIC_*
// values are inlined into the JS bundle: refuse if the QA switch or the debug token is set, in the environment
// or in a .env file that Expo would load.
const QA_VARIABLES = ['DELIVEROO_QA_APPCHECK_DEBUG', 'EXPO_PUBLIC_DELIVEROO_QA_APPCHECK_DEBUG', 'EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN'];
const qaFound = QA_VARIABLES.filter((name) => process.env[name]);
for (const file of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, 'utf8');
  for (const name of QA_VARIABLES) if (new RegExp(`^\\s*(export\\s+)?${name}\\s*=`, 'm').test(text)) qaFound.push(`${name} (in ${file})`);
}
if (qaFound.length > 0) {
  fail(`this is a QA setup, not a release: unset ${qaFound.join(', ')}. QA builds use the App Check debug provider and must never be published.`);
}
const abiOverride = process.env.DELIVEROO_ANDROID_ABIS;
if (abiOverride && abiOverride !== 'all' && !abiOverride.split(',').map((abi) => abi.trim()).includes('arm64-v8a')) {
  fail(`DELIVEROO_ANDROID_ABIS="${abiOverride}" has no arm64-v8a: a release must run on real phones. Unset it (default: arm64-v8a,armeabi-v7a).`);
}

if (git('status', '--porcelain') !== '') {
  fail('the git working tree is not clean. Commit or stash your changes (untracked files count) and try again.');
}
if (git('tag', '--list', tag) !== '') fail(`tag ${tag} already exists.`);

const missingEnv = SIGNING_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) fail(`release signing is not configured. Set: ${missingEnv.join(', ')}`);
if (!existsSync(process.env.DELIVEROO_KEYSTORE_PATH)) {
  fail(`DELIVEROO_KEYSTORE_PATH does not point to an existing file: ${process.env.DELIVEROO_KEYSTORE_PATH}`);
}
const googleServices = resolve(root, process.env.GOOGLE_SERVICES_JSON || './google-services.json');
if (!existsSync(googleServices)) {
  fail(`google-services.json not found at ${googleServices}. Download it from the Firebase console (or set GOOGLE_SERVICES_JSON).`);
}
if (publish) run('gh', ['auth', 'status'], { capture: true });

// ---- 3. Build --------------------------------------------------------------------------------------

console.log(`\n== Releasing Deliveroo ${tag} (current package.json: ${currentVersion}) ==`);

if (comparison !== 0) {
  rollbacks.push(() => {
    spawnSync('git', ['checkout', '--', 'package.json', 'package-lock.json'], { cwd: root, stdio: 'inherit' });
    console.error(`Restored package.json and package-lock.json to ${currentVersion}.`);
  });
  runShell('npm', ['version', version, '--no-git-tag-version']);
}

runShell('npx', ['expo', 'prebuild', '--platform', 'android', '--clean', '--no-install']);

const javaHome = process.env.JAVA_HOME;
const javaBin = javaHome ? join(javaHome, 'bin', isWindows ? 'java.exe' : 'java') : 'java';
console.log(`\n== java -version (JAVA_HOME=${javaHome ?? 'not set'}) ==`);
run(javaBin, ['-version']);

const androidDir = join(root, 'android');

// On Windows the native (CMake/ninja) builds exceed MAX_PATH unless ninja >= 1.12, which only ships
// with SDK CMake >= 3.31. Point every module at that CMake via local.properties (regenerated each
// prebuild). ANDROID_CMAKE_DIR overrides the automatic pick.
if (isWindows) {
  const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk');
  let cmakeDir = process.env.ANDROID_CMAKE_DIR;
  if (!cmakeDir) {
    const cmakeRoot = join(sdk, 'cmake');
    const versions = existsSync(cmakeRoot) ? readdirSync(cmakeRoot).filter((name) => /^\d+\.\d+\.\d+$/.test(name)) : [];
    const newest = versions.sort((a, b) => compare(parse(b), parse(a)))[0];
    if (!newest || compare(parse(newest), [3, 31, 0]) < 0) {
      fail(`no Android SDK CMake >= 3.31 under ${cmakeRoot} (found: ${versions.join(', ') || 'none'}). ` +
        'Install it with: sdkmanager "cmake;3.31.6" (older ninja cannot handle Windows long paths), or set ANDROID_CMAKE_DIR.');
    }
    cmakeDir = join(cmakeRoot, newest);
  }
  const toGradlePath = (p) => p.replace(/\\/g, '/');
  writeFileSync(join(androidDir, 'local.properties'), `sdk.dir=${toGradlePath(sdk)}\ncmake.dir=${toGradlePath(cmakeDir)}\n`);
  console.log(`\nUsing CMake from ${cmakeDir}`);
}

console.log('\n== gradlew assembleRelease ==');
if (isWindows) runShell('gradlew.bat', ['assembleRelease'], { cwd: androidDir });
else run('./gradlew', ['assembleRelease'], { cwd: androidDir });

const builtApk = join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
if (!existsSync(builtApk)) fail(`build finished but ${builtApk} does not exist.`);

// ---- 4. Collect the artifact -----------------------------------------------------------------------

const distDir = join(root, 'dist');
mkdirSync(distDir, { recursive: true });
const apkName = `deliveroo-v${version}.apk`;
const apkPath = join(distDir, apkName);
copyFileSync(builtApk, apkPath);

const sha256 = createHash('sha256').update(readFileSync(apkPath)).digest('hex');
const shaPath = `${apkPath}.sha256`;
writeFileSync(shaPath, `${sha256}  ${apkName}\n`);

const { expo } = require(join(root, 'app.config.js'));
const sizeMb = (statSync(apkPath).size / (1024 * 1024)).toFixed(2);
console.log('\n== Build result ==');
console.log(`APK:         ${apkPath}`);
console.log(`SHA-256:     ${sha256} (${shaPath})`);
console.log(`Size:        ${sizeMb} MB`);
console.log(`versionName: ${expo.version}`);
console.log(`versionCode: ${expo.android.versionCode}`);

// ---- 5. Commit and tag (local) ---------------------------------------------------------------------

const changed = git('status', '--porcelain')
  .split('\n')
  .filter(Boolean)
  .map((line) => line.slice(3));
const allowed = new Set(['package.json', 'package-lock.json']);
const unexpected = changed.filter((file) => !allowed.has(file));
if (unexpected.length > 0) {
  fail(`the build changed unexpected tracked files, not committing: ${unexpected.join(', ')}`);
}

if (changed.length > 0) {
  run('git', ['add', 'package.json', 'package-lock.json'].filter((file) => changed.includes(file)));
  run('git', ['commit', '-m', `Release ${tag}`]);
  rollbacks.length = 0; // the version bump is committed now; nothing left to undo
} else {
  console.log('\nNo version change to commit (--rebuild of the current version); tagging the current commit.');
}
run('git', ['tag', '-a', tag, '-m', `Release ${tag}`]);
console.log(`\nCreated local commit and annotated tag ${tag}.`);

// ---- 6. Publish (opt-in) ---------------------------------------------------------------------------

const releaseArgs = ['release', 'create', tag, `dist/${apkName}`, `dist/${apkName}.sha256`, '--title', `Deliveroo ${tag}`, '--generate-notes'];

if (publish) {
  console.log('\n== Publishing ==');
  run('git', ['push', 'origin', 'HEAD', '--follow-tags']);
  run('gh', releaseArgs);
  console.log(`\nPublished ${tag}.`);
} else {
  console.log('\nNothing was pushed. To publish this release run:\n');
  console.log('  git push origin HEAD --follow-tags');
  console.log(`  gh release create ${tag} dist/${apkName} dist/${apkName}.sha256 --title "Deliveroo ${tag}" --generate-notes`);
}
