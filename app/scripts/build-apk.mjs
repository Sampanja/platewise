// Builds a local release APK: expo prebuild (only when needed) + Gradle assembleRelease.
// Signed with this machine's ~/.android/debug.keystore (same as Flutter's
// default release signing), so every build has the same key and a new APK
// installs over the previous one. Test builds only, not for store upload.
//
// Windows notes:
// - Native libraries (e.g. react-native-reanimated) produce object paths over
//   260 characters. The SDK's default CMake 3.22.1 ships ninja 1.10, which is
//   not long-path aware and fails with "mkdir(...): No such file or directory"
//   even with LongPathsEnabled. We pin CMake 3.31.6 (ninja 1.12, long-path
//   aware) via cmake.dir in local.properties and install it if missing.
// - A Gradle daemon from a previous build keeps files in android/ locked, which
//   makes prebuild fail with EBUSY, so the daemon is stopped before a prebuild.
//
// Incremental builds: prebuild regenerates android/ from scratch, which throws
// away Gradle's compiled native code (10+ minutes to rebuild). It only runs when
// android/ is missing or the native fingerprint changed. The fingerprint comes
// from @expo/fingerprint (shipped with expo) and covers the whole Expo config
// (app.json incl. name, package and versions), config plugins, icons and
// autolinked native packages with their versions. It is stored in android/
// after each prebuild. JS-only changes never need a prebuild.
// `npm run apk:clean` (--clean) forces prebuild --clean and a Gradle clean.
//
// Only arm64-v8a is built: every current Android phone uses it, and building one
// ABI instead of four makes the native compile several times faster.

import { spawnSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, platform } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const androidDir = join(projectRoot, 'android');
const isWindows = platform() === 'win32';
const CMAKE_VERSION = '3.31.6';
const ARCHITECTURES = 'arm64-v8a';
const FINGERPRINT_FILE = join(androidDir, '.native-fingerprint');
const clean = process.argv.includes('--clean');

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function firstExisting(paths) {
  return paths.find((p) => p && existsSync(p));
}

function resolveJavaHome() {
  const javaHome = firstExisting([
    process.env.JAVA_HOME,
    // Android Studio's bundled JDK, which Flutter also uses.
    isWindows && 'C:\\Program Files\\Android\\Android Studio\\jbr',
    !isWindows && '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
  ]);
  if (!javaHome) {
    fail('JDK not found. Install Android Studio or set JAVA_HOME to a JDK 17+.');
  }
  const java = join(javaHome, 'bin', isWindows ? 'java.exe' : 'java');
  // `java -version` prints to stderr.
  const result = spawnSync(java, ['-version'], { encoding: 'utf8' });
  const match = /version "(\d+)/.exec(result.stderr ?? '');
  const major = match ? Number(match[1]) : 0;
  if (major < 17) {
    fail(`JDK at ${javaHome} is version ${major || 'unknown'}; React Native needs JDK 17 or newer.`);
  }
  return javaHome;
}

function resolveAndroidHome() {
  const sdk = firstExisting([
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    isWindows && process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Android', 'Sdk'),
    !isWindows && join(homedir(), 'Library', 'Android', 'sdk'),
    !isWindows && join(homedir(), 'Android', 'Sdk'),
  ]);
  if (!sdk) {
    fail('Android SDK not found. Install it via Android Studio or set ANDROID_HOME.');
  }
  return sdk;
}

function run(command, args, cwd, env, { allowFailure = false } = {}) {
  console.log(`\n› ${command} ${args.join(' ')}`);
  // shell is needed on Windows to run npx.cmd, gradlew.bat and sdkmanager.bat.
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit', shell: isWindows });
  if (result.status !== 0 && !allowFailure) {
    fail(`${command} ${args.join(' ')} failed (exit code ${result.status}).`);
  }
}

// Absolute paths are quoted on Windows (spaces), and used because cmd.exe may be
// configured not to search the current directory.
function executable(path) {
  return isWindows ? `"${path}"` : path;
}

function ensureCmake(androidHome, env) {
  const cmakeDir = join(androidHome, 'cmake', CMAKE_VERSION);
  if (existsSync(join(cmakeDir, 'bin', isWindows ? 'cmake.exe' : 'cmake'))) {
    return cmakeDir;
  }
  const sdkmanager = join(
    androidHome,
    'cmdline-tools',
    'latest',
    'bin',
    isWindows ? 'sdkmanager.bat' : 'sdkmanager',
  );
  if (!existsSync(sdkmanager)) {
    fail(
      `CMake ${CMAKE_VERSION} is missing and sdkmanager was not found. Install "CMake ${CMAKE_VERSION}" ` +
        'in Android Studio (SDK Manager → SDK Tools → Show Package Details).',
    );
  }
  run(executable(sdkmanager), [`"cmake;${CMAKE_VERSION}"`], projectRoot, env);
  if (!existsSync(cmakeDir)) {
    fail(`Installing CMake ${CMAKE_VERSION} did not create ${cmakeDir}.`);
  }
  return cmakeDir;
}

// cmake.dir applies to every native module in the build, including those in node_modules.
function setCmakeDir(cmakeDir) {
  const localProperties = join(androidDir, 'local.properties');
  const current = existsSync(localProperties) ? readFileSync(localProperties, 'utf8') : '';
  if (/^cmake\.dir=/m.test(current)) {
    return;
  }
  // Properties files treat backslash as an escape character.
  const value = cmakeDir.replace(/\\/g, '/');
  const separator = current === '' || current.endsWith('\n') ? '' : '\n';
  appendFileSync(localProperties, `${separator}cmake.dir=${value}\n`);
}

/** Hash of everything that affects the generated native project. */
async function nativeFingerprint() {
  // @expo/fingerprint is a dependency of expo; resolve it from there.
  const requireFromExpo = createRequire(join(projectRoot, 'node_modules', 'expo', 'package.json'));
  const { createFingerprintAsync, SourceSkips } = requireFromExpo('@expo/fingerprint');
  const fingerprint = await createFingerprintAsync(projectRoot, {
    platforms: ['android'],
    // android/ is generated output; only its presence matters, not its contents.
    ignorePaths: ['android/**/*', 'ios/**/*'],
    // The default skips (meant for OTA update compatibility) leave out the app
    // name, package, scheme and versions, which all change the generated native
    // project. Skip only sources that never affect it.
    sourceSkips:
      SourceSkips.PackageJsonScriptsAll | SourceSkips.GitIgnore | SourceSkips.EasJson | SourceSkips.Easignore,
    silent: true,
  });
  return fingerprint.hash;
}

/** Reason to run prebuild, or null when the existing android/ can be reused. */
async function whyPrebuild(gradlew) {
  if (clean) return 'clean build requested';
  if (!existsSync(gradlew)) return 'android/ does not exist';
  if (!existsSync(FINGERPRINT_FILE)) return 'no stored native fingerprint';
  const stored = readFileSync(FINGERPRINT_FILE, 'utf8').trim();
  const current = await nativeFingerprint();
  return stored === current ? null : 'native config, plugins or packages changed';
}

const env = {
  ...process.env,
  JAVA_HOME: resolveJavaHome(),
  ANDROID_HOME: resolveAndroidHome(),
};
console.log(`JAVA_HOME=${env.JAVA_HOME}\nANDROID_HOME=${env.ANDROID_HOME}`);

const gradlew = join(androidDir, isWindows ? 'gradlew.bat' : 'gradlew');
const cmakeDir = ensureCmake(env.ANDROID_HOME, env);

const prebuildReason = await whyPrebuild(gradlew);
if (prebuildReason) {
  console.log(`\n› Prebuild needed: ${prebuildReason}`);
  if (existsSync(gradlew)) {
    // Release file locks held by a daemon from an earlier build (EBUSY in prebuild).
    run(executable(gradlew), ['--stop'], androidDir, env, { allowFailure: true });
  }
  run('npx', ['expo', 'prebuild', '--platform', 'android', '--no-install', '--clean'], projectRoot, env);
  writeFileSync(FINGERPRINT_FILE, `${await nativeFingerprint()}\n`);
} else {
  console.log('\n› Native project is up to date: skipping prebuild (npm run apk:clean for a full build).');
}

const keystore = join(homedir(), '.android', 'debug.keystore');
if (!existsSync(keystore)) {
  fail(
    `${keystore} not found. Create it once with:\n` +
      `  keytool -genkeypair -v -keystore "${keystore}" -storepass android -alias androiddebugkey ` +
      `-keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"`,
  );
}
// The generated build.gradle signs release builds with app/debug.keystore
// (alias androiddebugkey, password android), which matches the standard debug keystore.
copyFileSync(keystore, join(androidDir, 'app', 'debug.keystore'));

setCmakeDir(cmakeDir);

run(
  executable(gradlew),
  [...(clean ? ['clean'] : []), 'assembleRelease', `-PreactNativeArchitectures=${ARCHITECTURES}`],
  androidDir,
  env,
);

const apk = join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
if (!existsSync(apk)) {
  fail(`Build finished but ${apk} is missing.`);
}
console.log(`\n✔ APK ready: ${apk}`);
