import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'vite'),
    emptyOutDir: true,
    assetsDir: '',
    lib: {
      entry: {
        ckeconfig: resolve(__dirname, 'src/ckeconfig.js'),
      },
      name: 'ckeconfig',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['ckeditor5', 'jquery', '@craftcms/ckeditor'],
      globals: {
        jquery: '$',
      },
    },
  },
});
