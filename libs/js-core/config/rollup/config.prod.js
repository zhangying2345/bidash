/**
 * Rollup config for production build
 */

module.exports = {
  input: './src/index.ts',
  output: [
    {
      file: './dist/bundle/index.umd.js',
      format: 'umd',
      name: 'sipJsCore', // must supply output.name for UMD bundles
      exports: 'named',
      sourcemap: false
    },
    {
      file: './dist/bundle/index.es.js',
      format: 'es',
      sourcemap: false
    }
  ]
};
