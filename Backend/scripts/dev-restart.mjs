/**
 * Cross-platform dev server restart — frees the backend port then starts with --watch.
 */
import { execSync, spawn } from 'node:child_process';

const port = Number(process.env.PORT) || 5001;

function freePort(targetPort) {
  if (process.platform === 'win32') {
    try {
      const output = execSync(`netstat -ano | findstr :${targetPort}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });

      const pids = new Set();
      for (const line of output.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes('LISTENING')) continue;
        const pid = trimmed.split(/\s+/).at(-1);
        if (pid && pid !== '0') pids.add(pid);
      }

      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        } catch {
          // Process may have already exited.
        }
      }
    } catch {
      // No process was listening on the port.
    }
    return;
  }

  try {
    execSync(`lsof -ti :${targetPort} | xargs kill -9 2>/dev/null`, {
      stdio: 'ignore',
      shell: true,
    });
  } catch {
    // No process was listening on the port.
  }
}

freePort(port);

const child = spawn('node', ['--watch', 'server.js'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 0));
