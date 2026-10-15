import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const publicDir=fileURLToPath(new URL('../public/',import.meta.url));
for(const width of [160,320,480,640,960]){
  const result=await sharp(`${publicDir}bb-logo-v9.png`).resize({width}).webp({quality:90,alphaQuality:100}).toFile(`${publicDir}bb-logo-v9-${width}w.webp`);
  console.log(`${width}px: ${result.size} bytes`);
}
