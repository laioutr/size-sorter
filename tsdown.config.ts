import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts'],
  format: ['esm'],
  dts: { generator: 'oxc' },
  unbundle: true,
  platform: 'neutral',
  target: 'es2022',
  fixedExtension: false,
  clean: true,
  outDir: 'dist',
});
