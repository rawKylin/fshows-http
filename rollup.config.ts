import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
// import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'

const pkg = require('./package.json')

const libraryName = 'fslogger'

export default {
  input: `src/index.ts`,
  output: [
    {
      file: pkg.main,
      name: camelCase(libraryName),
      format: 'umd',
      sourcemap: true,
      globals: {
        'axios': 'axios'
      }
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      globals: {
        'axios': 'axios'
      }
    },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['axios'],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    resolve()

    // Resolve source maps to the original source
    // sourceMaps()
  ],
}
