import {defineConfig} from 'vite';

// The page and the modern 3D (three.js r170, WebGL 2 with WebGL 1 fallback inside three). The
// WebGL-1-only build of the same scene comes from vite.legacy.config.js into dist/legacy/.
// Targets reach iOS 13 / Chrome 79 so older phones still run the designer.
export default defineConfig({
  build: {target: ['es2019', 'safari13', 'chrome79'], cssTarget: ['safari13', 'chrome79'], outDir: 'dist', assetsInlineLimit: 0, sourcemap: false, chunkSizeWarningLimit: 900},
  server: {port: 4987, strictPort: true, proxy: {'/api': 'http://127.0.0.1:8899'}},
  preview: {port: 4988, strictPort: true, proxy: {'/api': 'http://127.0.0.1:8899'}}
});
