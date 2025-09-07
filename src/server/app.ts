import { Hono } from 'hono'
// import { upgradeWebSocket } from 'hono/bun'
import {} from '@hono/node-ws'
import z from 'zod'
import { logger as loggerMiddleware } from 'hono/logger'
import { logger } from '../lib/logger'
// import { createServer } from 'vite'
// import { fileURLToPath } from 'node:url'
// import * as fs from 'node:fs/promises'
// import * as path from 'node:path'
import { safeParseJSON } from '../lib/utils'

export const app = new Hono()
  .use(
    loggerMiddleware((...args) => {
      // @ts-expect-error args can be passed easily but it is not present in typedef
      logger.info(...args)
    }),
  )
  .get(
    '/api/ws',
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
  .get('/api/me', (c) => c.json({ name: 'Abinash Panda' }))

export type App = typeof app

// const __dirname = fileURLToPath(new URL('.', import.meta.url))
// const clientRoot = path.resolve(__dirname, '../client')
// const isProd = import.meta.env.NODE_ENV === 'production'

// const vite = await createServer({
//   root: clientRoot,
//   server: { middlewareMode: true },
//   appType: 'custom',
// })

// const contentTypes: Record<string, string> = {
//   '.js': 'application/javascript',
//   '.ts': 'application/javascript',
//   '.tsx': 'application/javascript',
//   '.mjs': 'application/javascript',
//   '.css': isProd
//     ? 'text/css'
//     : // css files are generally transformed by vite and
//       // importing it will inject its content to the page via a <style> tag with HMR support.
//       'application/javascript',
//   '.png': 'image/png',
//   '.jpg': 'image/jpeg',
//   '.jpeg': 'image/jpeg',
//   '.gif': 'image/gif',
//   '.svg': 'image/svg+xml',
//   '.ico': 'image/x-icon',
// }

// if (isProd) {
//   const distRoot = path.resolve(clientRoot, 'dist')
//   const indexTemplate = await fs.readFile(
//     path.resolve(distRoot, 'index.html'),
//     'utf-8',
//   )
//   app.get('*', async (c) => {
//     const url = new URL(c.req.url)
//     let pathname = url.pathname

//     if (pathname.startsWith('/assets')) {
//       pathname = path.resolve(distRoot, pathname.slice(1))

//       if (!(await fs.exists(pathname))) {
//         return c.body('asset not found', 404)
//       }

//       const content = (await fs.readFile(pathname)) as Buffer<ArrayBuffer>
//       if (!content) {
//         return c.body('asset not found', 404)
//       }

//       const extname = path.extname(pathname)
//       const contentType = contentTypes[extname] ?? 'application/octet-stream'

//       return c.body(content, 200, {
//         'Content-Type': contentType,
//       })
//     }

//     const content = indexTemplate.replace(
//       '<!--ssr_injection_point-->',
//       `<script type="text/javascript">window.__public_key__ = "random_public_key";</script>`.trim(),
//     )

//     return c.html(content)
//   })
// } else {
//   const indexTemplate = await fs.readFile(
//     path.resolve(clientRoot, 'index.html'),
//     'utf-8',
//   )
//   app.get('*', async (c) => {
//     const url = new URL(c.req.url)
//     let pathname = url.pathname

//     if (
//       pathname.startsWith('/@vite') ||
//       pathname.startsWith('/@react-refresh') ||
//       pathname.startsWith('/src/') ||
//       pathname.startsWith('/node_modules/') ||
//       pathname.includes('.js') ||
//       pathname.includes('.ts') ||
//       pathname.includes('.tsx') ||
//       pathname.includes('.jsx') ||
//       pathname.includes('.mjs') ||
//       pathname.includes('.css')
//     ) {
//       const result = await vite.transformRequest(pathname)
//       if (!result) {
//         return c.body('asset not found', 404)
//       }

//       const extname = path.extname(pathname)
//       const contentType = contentTypes[extname] ?? 'application/javascript'

//       return c.body(result.code, 200, {
//         'Content-Type': contentType,
//         'Cache-Control': 'no-cache',
//       })
//     }

//     if (pathname.startsWith('/assets')) {
//       pathname = path.resolve(clientRoot, 'public', pathname.slice(1))

//       if (!(await fs.exists(pathname))) {
//         return c.body('asset not found', 404)
//       }

//       const content = (await fs.readFile(pathname)) as Buffer<ArrayBuffer>
//       if (!content) {
//         return c.body('asset not found', 404)
//       }

//       const extname = path.extname(pathname)
//       const contentType = contentTypes[extname] ?? 'application/octet-stream'

//       return c.body(content, 200, {
//         'Content-Type': contentType,
//       })
//     }

//     let content = await vite.transformIndexHtml(c.req.url, indexTemplate)
//     content = content.replace(
//       '<!--ssr_injection_point-->',
//       `<script type="text/javascript">window.__public_key__ = "random_public_key";</script>`.trim(),
//     )

//     return c.html(content)
//   })
// }
