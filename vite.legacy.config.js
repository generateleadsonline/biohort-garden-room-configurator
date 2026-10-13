import {defineConfig} from 'vite';

// The same 3D scene built on three.js r162 (npm alias three-webgl1), the last release that still
// runs on WebGL 1. The page loads /legacy/scene.js only when a device has no WebGL 2.
export default defineConfig({
  publicDir: false,
  resolve: {alias: [{find: /^three\/addons\/(.*)$/, replacement: 'three-webgl1/examples/jsm/$1'}, {find: /^three$/, replacement: 'three-webgl1'}]},
  build: {
    target: ['es2019', 'safari13', 'chrome79'], outDir: 'dist/legacy', emptyOutDir: true, sourcemap: false,
    lib: {entry: 'src/scene/scene.js', formats: ['es'], fileName: () => 'scene.js'},
    rollupOptions: {output: {inlineDynamicImports: true}}
  }
});
