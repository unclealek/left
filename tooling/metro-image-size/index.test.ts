import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {expect,it} from 'vitest';
const require=createRequire(import.meta.url);
const imageSize=require('./index.cjs');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ZkAAAAASUVORK5CYII=','base64');
it('supports the buffer and path overloads actually used by Metro',()=>{
 const dir=mkdtempSync(join(tmpdir(),'left-image-size-'));
 try {
  const path=join(dir,'pixel.png');writeFileSync(path,png);
  expect(imageSize(png)).toMatchObject({width:1,height:1});
  expect(imageSize.default(path)).toMatchObject({width:1,height:1});
 } finally {rmSync(dir,{recursive:true,force:true});}
});
it('rejects malformed data and nonexistent files',()=>{
 expect(()=>imageSize(Buffer.from('invalid'))).toThrow();
 expect(()=>imageSize('/this/file/does/not/exist.png')).toThrow();
});
it('Metro resolves the adapter and the patched upstream parser',()=>{
 const metroRequire=createRequire(require.resolve('metro/package.json'));
 expect(metroRequire('image-size')(png)).toMatchObject({width:1,height:1});
 expect(imageSize.types).toEqual(require('image-size-modern').types);
});
