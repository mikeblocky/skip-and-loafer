import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const target = join(process.cwd(), 'dist', '.assetsignore');
const content = [
  '# Large files served from Cloudflare R2 by worker/index.js',
  'anime/episode1.mp4',
  '',
].join('\n');

await mkdir(dirname(target), { recursive: true });
await writeFile(target, content, 'utf8');
