import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: 'dist/index.js',
  format: 'esm',
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
  external: ['@prisma/client', '@prisma/adapter-neon', '@neondatabase/serverless', 'dotenv'],
  sourcemap: true,
  minify: false,
});

console.log('✅ Build complete: dist/index.js');
