import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, expect } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const fixtureDir = path.join(rootDir, 'examples/taro-vue3-basic')
const h5DistDir = path.join(fixtureDir, 'dist')

function run(command, args, cwd = rootDir) {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
  })
}

function getContentType(filePath) {
  const ext = path.extname(filePath)

  if (ext === '.html') return 'text/html; charset=utf-8'
  if (ext === '.js') return 'text/javascript; charset=utf-8'
  if (ext === '.css') return 'text/css; charset=utf-8'
  if (ext === '.svg') return 'image/svg+xml'
  if (ext === '.json') return 'application/json; charset=utf-8'

  return 'application/octet-stream'
}

function resolveStaticFile(url = '/') {
  const { pathname } = new URL(url, 'http://127.0.0.1')
  const decodedPath = decodeURIComponent(pathname)
  const normalizedPath = path
    .normalize(decodedPath)
    .replace(/^(\.\.[/\\])+/, '')
  const requestedFile = path.join(h5DistDir, normalizedPath)

  if (
    requestedFile.startsWith(h5DistDir) &&
    existsSync(requestedFile) &&
    statSync(requestedFile).isFile()
  ) {
    return requestedFile
  }

  if (path.extname(decodedPath)) {
    return ''
  }

  return path.join(h5DistDir, 'index.html')
}

function createStaticServer() {
  const server = createServer(function handleRequest(req, res) {
    const filePath = resolveStaticFile(req.url)

    if (!filePath || !existsSync(filePath)) {
      res.writeHead(404)
      res.end('Not found')
      return
    }

    res.writeHead(200, {
      'content-type': getContentType(filePath),
    })
    createReadStream(filePath).pipe(res)
  })

  return new Promise(function listen(resolve, reject) {
    server.on('error', reject)
    server.listen(0, '127.0.0.1', function handleListening() {
      const address = server.address()

      if (!address || typeof address === 'string') {
        reject(new Error('Failed to allocate H5 runtime smoke port'))
        return
      }

      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close() {
          return new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) closeReject(error)
              else closeResolve()
            })
          })
        },
      })
    })
  })
}

async function runRuntimeAssertions(baseUrl) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const pageErrors = []

  page.on('pageerror', (error) => {
    pageErrors.push(error)
  })

  try {
    await page.goto(`${baseUrl}/`)
    await expect(page.getByTestId('active-title')).toContainText(
      '当前 Tab：首页',
    )

    if (pageErrors.length > 0) {
      throw pageErrors[0]
    }
  } finally {
    await browser.close()
  }
}

run('pnpm', ['run', 'test:taro:prepare'])
run('pnpm', ['--dir', fixtureDir, 'run', 'build:h5'])

const server = await createStaticServer()

try {
  await runRuntimeAssertions(server.baseUrl)
  console.log('✓ Taro H5 runtime smoke passed')
} finally {
  await server.close()
}
