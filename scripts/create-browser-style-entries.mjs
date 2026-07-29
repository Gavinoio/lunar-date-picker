import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve(process.cwd(), 'dist')
const entries = ['react', 'vue']

for (const entry of entries) {
  const esmFile = resolve(distDir, `${entry}.mjs`)
  const cjsFile = resolve(distDir, `${entry}.js`)

  if (!existsSync(esmFile) || !existsSync(cjsFile)) {
    throw new Error(`Missing ${entry} build output before creating browser style entries`)
  }

  writeFileSync(
    resolve(distDir, `${entry}.browser.mjs`),
    `import './style.css'\nexport * from './${entry}.mjs'\n`
  )

  writeFileSync(
    resolve(distDir, `${entry}.browser.js`),
    `require('./style.css')\nmodule.exports = require('./${entry}.js')\n`
  )
}
