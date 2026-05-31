import { spawn } from 'node:child_process';

const commands = [
  ['npm', ['run', 'dev:server']],
  ['npm', ['run', 'dev:frontend']]
];

const children = commands.map(([cmd, args]) => {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
  child.on('exit', (code) => {
    if (code && !process.exitCode) process.exitCode = code;
  });
  return child;
});

function shutdown() {
  for (const child of children) child.kill('SIGTERM');
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
