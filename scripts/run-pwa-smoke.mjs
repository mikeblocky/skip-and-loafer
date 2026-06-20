import { spawn } from 'node:child_process';
import http from 'node:http';

const host = '127.0.0.1';
const port = 4174;
const baseUrl = `http://${host}:${port}`;

const waitForServer = (url, timeoutMs = 120000) => new Promise((resolve, reject) => {
  const startedAt = Date.now();
  const tick = () => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve();
    });
    req.on('error', () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(tick, 500);
    });
    req.setTimeout(2000, () => {
      req.destroy();
    });
  };
  tick();
});

const getSpawnCommand = (command, args) => {
  if (process.platform !== 'win32' || !command.endsWith('.cmd')) {
    return { command, args };
  }
  return {
    command: 'cmd.exe',
    args: ['/d', '/s', '/c', command, ...args],
  };
};

const run = (command, args, options = {}) => new Promise((resolve, reject) => {
  const spawnCommand = getSpawnCommand(command, args);
  const child = spawn(spawnCommand.command, spawnCommand.args, {
    stdio: 'inherit',
    ...options,
  });
  child.on('exit', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
  });
  child.on('error', reject);
});

const stopProcess = (child) => new Promise((resolve) => {
  if (!child || child.killed) {
    resolve();
    return;
  }

  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
    });
    killer.on('exit', () => resolve());
    killer.on('error', () => resolve());
    return;
  }

  child.kill('SIGTERM');
  setTimeout(resolve, 500);
});

let preview;
let exitCode = 0;

try {
  await run('npm.cmd', ['run', 'build']);
  preview = spawn('node', ['./node_modules/vite/bin/vite.js', 'preview', '--host', host, '--port', String(port)], {
    stdio: 'inherit',
  });
  await waitForServer(baseUrl);
  await run('npx.cmd', ['playwright', 'test', '--config=playwright.pwa.config.js']);
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  await stopProcess(preview);
  process.exit(exitCode);
}
