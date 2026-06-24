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
    await page.goto(`${baseUrl}/pages/index/index?tab=orders&from=runtime`)
    await expect(page.getByTestId('active-title')).toContainText(
      '当前 Tab：订单',
    )
    await expect(page.getByTestId('pane-orders')).toBeVisible()
    await expect(page.getByTestId('pane-visited-orders')).toContainText(
      'visited: yes',
    )

    await page.getByTestId('pane-state-action-orders').click()
    await expect(page.getByTestId('pane-state-orders')).toContainText(
      'pane local state: 1',
    )

    await page.getByTestId('tabbar-item-profile').click()
    await expect(page.getByTestId('active-title')).toContainText(
      '当前 Tab：我的',
    )
    await expect(page.getByTestId('pane-profile')).toBeVisible()

    await page.getByTestId('tabbar-item-orders').click()
    await expect(page.getByTestId('active-title')).toContainText(
      '当前 Tab：订单',
    )
    await expect(page.getByTestId('pane-state-orders')).toContainText(
      'pane local state: 1',
    )

    await page.getByTestId('tabbar-item-orders').click()
    await expect(page.getByTestId('pane-refresh-status-orders')).toContainText(
      'refresh status: loading',
    )
    await expect(page.getByTestId('pane-refresh-status-orders')).toContainText(
      'refresh status: success',
    )
    await expect(page.getByTestId('pane-retap-orders')).toContainText(
      'retap refresh count: 1',
    )

    const previewUrl = await page
      .getByTestId('redirect-preview-url')
      .innerText()
    expect(previewUrl).toContain('/pages/index/index?tab=home')
    expect(previewUrl).toContain('campaign=summer')
    expect(previewUrl).toContain('from=share-card')
    expect(previewUrl).not.toContain('embedded=')
    expect(previewUrl).not.toContain('tab=legacy')

    await page.getByTestId('pane-detail-action-orders').click()
    await expect(page.getByTestId('detail-title')).toContainText(
      'Fixture 详情页',
    )
    await expect(page.getByTestId('detail-tab')).toContainText(
      '来源 Tab：orders',
    )
    await page.getByTestId('detail-back').click()
    await expect(page.getByTestId('active-title')).toContainText(
      '当前 Tab：订单',
    )
    await expect(page.getByTestId('pane-state-orders')).toContainText(
      'pane local state: 1',
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
