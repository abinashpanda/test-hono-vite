import { Hono } from 'hono'
import { websocket, upgradeWebSocket } from 'hono/bun'
import z from 'zod'
import { logger as loggerMiddleware } from 'hono/logger'
import { createServer } from 'vite'
import { logger } from '../lib/logger'
import { fileURLToPath } from 'node:url'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { safeParseJSON } from '../lib/utils'

const app = new Hono()
  .use(
    loggerMiddleware((...args) => {
      // @ts-expect-error args can be passed easily but it is not present in typedef
      logger.info(...args)
    }),
  )
  .get(
    '/ws',
    upgradeWebSocket(() => ({
      onOpen: () => {},
      onMessage: (event, ws) => {
        const messageSchema = z.object({ type: z.literal('ping') })
        const parseResult = messageSchema.safeParse(safeParseJSON(event.data))
        if (parseResult.success) {
          ws.send(JSON.stringify({ type: 'pong' }))
        }
      },
    })),
  )
  .get('/me', (c) => c.json({ name: 'Abinash Panda' }))

export type App = typeof app

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const clientRoot = path.resolve(__dirname, '../client')

const vite = await createServer({
  root: clientRoot,
  server: { middlewareMode: true },
  appType: 'custom',
})
const indexTemplate = await fs.readFile(
  path.resolve(__dirname, '../client/index.html'),
  'utf-8',
)
const contentTypes: Record<string, string> = {
  '.js': 'application/javascript',
  '.ts': 'application/javascript',
  '.tsx': 'application/javascript',
  '.mjs': 'application/javascript',
  // css files are generally transformed by vite and
  // importing it will inject its content to the page via a <style> tag with HMR support.
  '.css': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

app.get('*', async (c) => {
  const url = new URL(c.req.url)
  let pathname = url.pathname

  if (
    pathname.startsWith('/@vite') ||
    pathname.startsWith('/@react-refresh') ||
    pathname.startsWith('/src/') ||
    pathname.startsWith('/node_modules/') ||
    pathname.includes('.js') ||
    pathname.includes('.ts') ||
    pathname.includes('.tsx') ||
    pathname.includes('.jsx') ||
    pathname.includes('.mjs') ||
    pathname.includes('.css')
  ) {
    const result = await vite.transformRequest(pathname)
    if (!result) {
      return c.body('asset not found', 404)
    }

    const extname = path.extname(pathname)
    const contentType = contentTypes[extname] ?? 'application/javascript'

    return c.body(result.code, 200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    })
  }

  if (pathname.startsWith('/assets')) {
    pathname = path.resolve(clientRoot, 'public', pathname.slice(1))

    const content = (await fs.readFile(pathname)) as Buffer<ArrayBuffer>
    if (!content) {
      return c.body('asset not found', 404)
    }

    const extname = path.extname(pathname)
    const contentType = contentTypes[extname] ?? 'application/octet-stream'

    return c.body(content, 200, {
      'Content-Type': contentType,
    })
  }

  let content = await vite.transformIndexHtml(c.req.url, indexTemplate)
  content = content.replace(
    '<!--ssr_injection_point-->',
    `<script type="text/javascript">window.__public_key__ = "random_public_key";</script>`.trim(),
  )

  return c.html(content)
})

const server = Bun.serve({
  fetch: app.fetch,
  websocket,
  port: 4000,
})
logger.info(`server started at ${server.url}`)
