import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

const files = [
  'dist/core.mjs',
  'dist/core.js',
  'dist/core.d.ts',
  'dist/vue.mjs',
  'dist/vue.js',
  'dist/vue.browser.mjs',
  'dist/vue.browser.js',
  'dist/vue.d.ts',
  'dist/react.mjs',
  'dist/react.js',
  'dist/react.browser.mjs',
  'dist/react.browser.js',
  'dist/react.d.ts',
  'dist/style.css'
]

for (const file of files) {
  const fullPath = resolve(root, file)
  if (!existsSync(fullPath)) {
    throw new Error(`Missing package artifact: ${file}`)
  }
}

const coreEsm = await import(pathToFileURL(resolve(root, 'dist/core.mjs')).href)
const reactEsm = await import(pathToFileURL(resolve(root, 'dist/react.mjs')).href)
const vueEsm = await import(pathToFileURL(resolve(root, 'dist/vue.mjs')).href)

const coreCjs = require(resolve(root, 'dist/core.js'))
const reactCjs = require(resolve(root, 'dist/react.js'))
const vueCjs = require(resolve(root, 'dist/vue.js'))

const requiredExports = [
  [coreEsm, 'DatePickerCore', 'core ESM'],
  [coreEsm, 'DateTimePickerCore', 'core ESM'],
  [coreEsm, 'resolveLocale', 'core ESM'],
  [coreCjs, 'DatePickerCore', 'core CJS'],
  [reactEsm, 'LunarDatePicker', 'react ESM'],
  [reactCjs, 'LunarDatePicker', 'react CJS'],
  [vueEsm, 'LunarDatePicker', 'vue ESM'],
  [vueCjs, 'LunarDatePicker', 'vue CJS']
]

for (const [mod, key, label] of requiredExports) {
  if (!(key in mod)) {
    throw new Error(`Missing ${key} export from ${label}`)
  }
}

const browserEntries = [
  ['dist/react.browser.mjs', "import './style.css'"],
  ['dist/vue.browser.mjs', "import './style.css'"],
  ['dist/react.browser.js', "require('./style.css')"],
  ['dist/vue.browser.js', "require('./style.css')"]
]

for (const [file, styleImport] of browserEntries) {
  const source = readFileSync(resolve(root, file), 'utf8')
  if (!source.includes(styleImport)) {
    throw new Error(`Missing style import in ${file}`)
  }
}

console.log('Package exports verified.')
