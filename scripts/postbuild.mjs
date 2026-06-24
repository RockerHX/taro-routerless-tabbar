import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const indexFile = path.join(distDir, 'index.js')
const styleFreeEntryFiles = [
  path.join(distDir, 'core.js'),
  path.join(distDir, 'vue.js'),
]
const styleFile = path.join(distDir, 'style.css')
const styleImport = 'import "./style.css";\n'

if (!existsSync(indexFile) || !existsSync(styleFile)) {
  process.exit(0)
}

const source = readFileSync(indexFile, 'utf8')

if (!source.startsWith(styleImport)) {
  writeFileSync(indexFile, `${styleImport}${source}`)
}

styleFreeEntryFiles.forEach((file) => {
  if (!existsSync(file)) {
    return
  }

  const content = readFileSync(file, 'utf8')

  if (content.includes('style.css')) {
    throw new Error(`Unexpected style.css import in ${path.basename(file)}`)
  }
})
