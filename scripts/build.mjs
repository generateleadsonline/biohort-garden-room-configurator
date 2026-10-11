import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/vendor',{recursive:true});
for(const f of ['index.html','style.css','app.js','scene.js']) await copyFile(f,`dist/${f}`);
await cp('assets','dist/assets',{recursive:true});
await copyFile('node_modules/three/build/three.module.js','dist/vendor/three.module.js');
await copyFile('node_modules/three/examples/jsm/controls/OrbitControls.js','dist/vendor/OrbitControls.js');
console.log('Built CasaNova design studio.');
