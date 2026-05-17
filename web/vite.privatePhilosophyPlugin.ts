import fs from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'

const RELATIVE_FILE = 'private/PHILOSOPHY_OWNER.txt'
const API_PREFIX = '/api/local/private/philosophy'

/** Разрешает путь к файлу философии относительно корня репозитория model. */
function resolvePhilosophyFile(repoRoot: string): string {
  return path.join(repoRoot, RELATIVE_FILE)
}

/** Обработчик GET/PUT для локального private/PHILOSOPHY_OWNER.txt (только dev/preview). */
function philosophyMiddleware(repoRoot: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url?.split('?')[0] ?? ''
    if (url !== API_PREFIX) return next()

    const filePath = resolvePhilosophyFile(repoRoot)

    if (req.method === 'GET') {
      try {
        const text = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.statusCode = 200
        res.end(text)
      } catch (err) {
        res.statusCode = 500
        res.end(err instanceof Error ? err.message : String(err))
      }
      return
    }

    if (req.method === 'PUT') {
      const chunks: Buffer[] = []
      req.on('data', (chunk: Buffer) => chunks.push(chunk))
      req.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf8')
          fs.mkdirSync(path.dirname(filePath), { recursive: true })
          fs.writeFileSync(filePath, body, 'utf8')
          res.statusCode = 204
          res.end()
        } catch (err) {
          res.statusCode = 500
          res.end(err instanceof Error ? err.message : String(err))
        }
      })
      return
    }

    res.statusCode = 405
    res.end('Method Not Allowed')
  }
}

/** Плагин Vite: чтение/запись private/PHILOSOPHY_OWNER.txt при локальной разработке. */
export function privatePhilosophyPlugin(): Plugin {
  let repoRoot = ''

  return {
    name: 'private-philosophy-local',
    configResolved(config) {
      repoRoot = path.resolve(config.root, '..')
    },
    configureServer(server) {
      server.middlewares.use(philosophyMiddleware(repoRoot))
    },
    configurePreviewServer(server) {
      server.middlewares.use(philosophyMiddleware(repoRoot))
    },
  }
}
