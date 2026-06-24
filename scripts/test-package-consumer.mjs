import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const tempDir = path.join(rootDir, '.temp')
const consumerTemplateDir = path.join(rootDir, 'examples/package-consumer')
const consumerDir = path.join(tempDir, 'package-consumer')

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    ...options,
  })
}

function runInConsumer(command, args) {
  run(command, args, { cwd: consumerDir })
}

function readPackageDistFile(fileName) {
  const filePath = path.join(
    consumerDir,
    'node_modules/taro-routerless-tabbar/dist',
    fileName,
  )

  return readFileSync(filePath, 'utf8')
}

rmSync(consumerDir, { force: true, recursive: true })
mkdirSync(tempDir, { recursive: true })

run('pnpm', ['run', 'build'])

const packOutput = execFileSync(
  'npm',
  ['pack', '--ignore-scripts', '--pack-destination', tempDir],
  {
    cwd: rootDir,
    encoding: 'utf8',
  },
)
const tarballName = packOutput.trim().split('\n').at(-1)

if (!tarballName) {
  throw new Error('Failed to resolve npm pack tarball name')
}

const tarballPath = path.join(tempDir, tarballName)

if (!existsSync(tarballPath)) {
  throw new Error(`Package tarball not found: ${tarballPath}`)
}

cpSync(consumerTemplateDir, consumerDir, { recursive: true })

const packageJsonPath = path.join(consumerDir, 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
packageJson.dependencies['taro-routerless-tabbar'] = `file:${tarballPath}`
writeFileSync(`${packageJsonPath}`, `${JSON.stringify(packageJson, null, 2)}\n`)

runInConsumer('npm', ['install', '--ignore-scripts'])

const indexSource = readPackageDistFile('index.js')
const coreSource = readPackageDistFile('core.js')
const vueSource = readPackageDistFile('vue.js')

if (!indexSource.startsWith('import "./style.css";')) {
  throw new Error('Expected root entry to import style.css')
}

if (coreSource.includes('style.css')) {
  throw new Error('Unexpected style.css import in core.js')
}

if (vueSource.includes('style.css')) {
  throw new Error('Unexpected style.css import in vue.js')
}

runInConsumer('npm', ['run', 'typecheck'])
runInConsumer('npm', ['run', 'build'])
