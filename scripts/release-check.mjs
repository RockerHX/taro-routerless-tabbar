import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const packageJson = JSON.parse(
  readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
)
const changelog = readFileSync(path.join(rootDir, 'CHANGELOG.md'), 'utf8')
const requiredFiles = [
  'dist',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'doc/api.md',
  'doc/integration-guide.md',
  'doc/retap-refresh.md',
  'doc/styling.md',
  'doc/compatibility.md',
  'doc/runtime-validation.md',
]

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

assert(
  changelog.startsWith('# Changelog\n\n## Unreleased'),
  'CHANGELOG.md must keep ## Unreleased at the top',
)

assert(
  changelog.includes(`## ${packageJson.version}`),
  `CHANGELOG.md must contain a ## ${packageJson.version} section`,
)

requiredFiles.forEach(function assertRequiredPackageFile(file) {
  assert(
    packageJson.files.includes(file),
    `package.json files must include ${file}`,
  )
})

execFileSync('pnpm', ['run', 'api:check'], {
  cwd: rootDir,
  stdio: 'inherit',
})

execFileSync('pnpm', ['run', 'prepublishOnly'], {
  cwd: rootDir,
  stdio: 'inherit',
})
