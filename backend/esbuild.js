// build.js
const esbuild = require('esbuild');
const path = require('path');

async function build() {
  try {
    const result = await esbuild.build({
      entryPoints: ['./src/index.js'],
      bundle: true,
      outdir: './dist',
      platform: 'node',
      target: 'node20',
      minify: true,
      legalComments: 'none', // Elimina comentarios de licencias
    });

    console.log('⚡ Build complete!', result);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
