import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, openSync, closeSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Expo SDK 54's native launcher only recognizes Simulator.app. Xcode 27 uses
// DeviceHub.app, so use Apple's public build/install tools for either version.
const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const requestedDevice = process.argv[2];
if (process.argv.length > 3) throw new Error('Usage: npm run ios:simulator -- [device name or UUID]');
let selected;
try { selected = execFileSync('xcode-select', ['-p'], { encoding: 'utf8' }).trim(); } catch {}
const developer = [process.env.DEVELOPER_DIR, selected,
  '/Applications/Xcode.app/Contents/Developer',
  '/Applications/Xcode-beta.app/Contents/Developer']
  .find(value => value && existsSync(path.join(value, 'usr/bin/simctl')));
if (!developer) throw new Error('Install full Xcode with an iOS simulator runtime first.');
const env = { ...process.env, DEVELOPER_DIR: developer, LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8' };
const run = (command, args) => execFileSync(command, args, { env, encoding: 'utf8' });
let metro;
let activeCommand;
let stopping = false;
const stop = () => { stopping = true; activeCommand?.kill('SIGTERM'); metro?.kill('SIGTERM'); };
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, stop);
const command = (name, args, stdio = 'inherit') => new Promise((resolve, reject) => {
  activeCommand = spawn(name, args, { env, stdio });
  activeCommand.once('error', reject);
  activeCommand.once('exit', code => { activeCommand = undefined; code === 0 ? resolve() : reject(new Error(`${name} exited with ${code}`)); });
});
const freePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    server.close(() => resolve(port));
  });
});

try {
  const devices = Object.values(JSON.parse(run('xcrun', ['simctl', 'list', 'devices', 'available', '-j'])).devices).flat();
  const device = requestedDevice
    ? devices.find(item => item.udid === requestedDevice || item.name === requestedDevice)
    : devices.find(item => item.state === 'Booted' && item.name.startsWith('iPhone'))
      ?? devices.find(item => item.name.startsWith('iPhone'));
  if (!device) throw new Error('No matching iPhone simulator. Install an iOS runtime in Xcode.');
  const simulatorApp = [path.join(developer, 'Applications/Simulator.app'),
    path.resolve(developer, '../Applications/DeviceHub.app')].find(existsSync);
  if (!simulatorApp) throw new Error('Neither Simulator nor Device Hub was found in Xcode.');
  if (device.state !== 'Booted') run('xcrun', ['simctl', 'boot', device.udid]);
  run('open', [simulatorApp]);
  await command('xcrun', ['simctl', 'bootstatus', device.udid, '-b']);
  await command('pod', ['install', '--project-directory=ios']);

  const port = await freePort();
  metro = spawn('npm', ['run', 'start', '--', '--dev-client', '--host', 'localhost', '--port', String(port)], { env, stdio: 'inherit' });
  let metroError;
  metro.once('error', error => { metroError = error; });
  const metroExit = new Promise(resolve => metro.once('exit', resolve));
  let ready = false;
  for (let attempt = 0; attempt < 90 && !stopping; attempt++) {
    if (metroError) throw metroError;
    if (metro.exitCode !== null || metro.signalCode !== null) throw new Error('Metro stopped before startup completed.');
    try {
      const response = await fetch(`http://localhost:${port}/status`, { signal: AbortSignal.timeout(1000) });
      ready = (await response.text()).includes('packager-status:running');
      if (ready) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!ready) throw new Error('Metro did not become ready.');
  mkdirSync('.expo', { recursive: true });
  const buildLog = '.expo/ios-simulator-build.log';
  const log = openSync(buildLog, 'w');
  const derivedData = path.join(root, '.expo/ios-simulator-build');
  console.log(`Building for ${device.name}. Build log: ${buildLog}`);
  try {
    await command('xcodebuild', ['-workspace', 'ios/Left.xcworkspace', '-scheme', 'Left',
      '-configuration', 'Debug', '-sdk', 'iphonesimulator', '-destination', `id=${device.udid}`,
      '-derivedDataPath', derivedData, 'CODE_SIGN_IDENTITY=-', 'build'], ['ignore', log, log]);
  } catch (error) {
    console.error(readFileSync(buildLog, 'utf8').split('\n').filter(line => line.includes('error:')).join('\n'));
    throw error;
  } finally { closeSync(log); }
  run('xcrun', ['simctl', 'install', device.udid, path.join(derivedData, 'Build/Products/Debug-iphonesimulator/Left.app')]);
  run('xcrun', ['simctl', 'launch', device.udid, 'com.left.mobile']);
  run('xcrun', ['simctl', 'openurl', device.udid,
    `exp+left-mobile://expo-development-client/?url=${encodeURIComponent(`http://localhost:${port}`)}`]);
  console.log(`Left launched on ${device.name}. Accept Open if iOS asks. Press Ctrl+C to stop Metro.`);
  await metroExit;
} catch (error) {
  if (!stopping) { console.error(error.message); process.exitCode = 1; }
} finally { stop(); }
