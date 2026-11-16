import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
async function size(dir) { let bytes=0;for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);bytes+=entry.isDirectory()?await size(path):(await stat(path)).size;}return bytes; }
const bytes=await size('dist');
console.log(`Total static output (uncompressed, including lazy 3D): ${bytes} bytes / ${(bytes/1048576).toFixed(3)} MiB`);
if(bytes>=10_000_000) { console.error('10 MB asset budget exceeded');process.exitCode=1; }
