/**
 * Rollup config for development build
 */

// import resolve from 'rollup-plugin-node-resolve'
// import commonjs from 'rollup-plugin-commonjs'
// import sourceMaps from 'rollup-plugin-sourcemaps'
// import typescript from 'rollup-plugin-typescript2'

module.exports = {
  input: './src/index.ts',
  output: [
    {
      file: './dist/bundle/index.umd.js',
      format: 'umd',
      name: 'sipJsCore', // must supply output.name for UMD bundles, camelCase
      exports: 'named',
      sourcemap: true
    },
    {
      file: './dist/bundle/index.es.js',
      format: 'es',
      sourcemap: true
    }
  ],
  watch: {
    include: 'src/**'
  }
  // plugins: [
  //   // Allow json resolution
  //   json(),
  //   // Compile TypeScript files
  //   typescript({ useTsconfigDeclarationDir: true }),
  //   // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
  //   commonjs(),
  //   // Allow node_modules resolution, so you can use 'external' to control
  //   // which external modules to include in the bundle
  //   // https://github.com/rollup/rollup-plugin-node-resolve#usage
  //   resolve(),

  //   // Resolve source maps to the original source
  //   sourceMaps(),
  // ]
};
