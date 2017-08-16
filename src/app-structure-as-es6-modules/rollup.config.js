import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import copy from 'rollup-plugin-copy'

export default {
  entry: 'src/js/app.js',
  dest: 'dist/app.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    copy({
        "src/index.html": "dist/index.html",
        "src/css/app.css": "dist/app.css"
    })
  ]
}