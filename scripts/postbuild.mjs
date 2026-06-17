import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const indexFile = path.join(distDir, 'index.js')
const styleFile = path.join(distDir, 'style.css')

if (!existsSync(indexFile) || !existsSync(styleFile)) {
  process.exit(0)
}

const source = readFileSync(indexFile, 'utf8')
const styleImport = 'import "./style.css";\n'

if (!source.startsWith(styleImport)) {
  writeFileSync(indexFile, `${styleImport}${source}`)
}
