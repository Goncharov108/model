import http from 'node:http'

const PORT = Number(process.env.PORT) || 3847
const HOST = process.env.HOST || '127.0.0.1'

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

async function readJsonBody(req) {
  return await new Promise((resolve, reject) => {
    let raw = ''

    req.on('data', (chunk) => {
      raw += String(chunk)
      if (raw.length > 100_000) {
        reject(new Error('PAYLOAD_TOO_LARGE'))
      }
    })

    req.on('end', () => {
      if (!raw.trim()) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('INVALID_JSON'))
      }
    })

    req.on('error', () => reject(new Error('READ_ERROR')))
  })
}

function countWords(input) {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true, service: 'model-api-placeholder', version: '0.2.0' })
    return
  }

  // nginx: location /api/ → proxy_pass :3847/ — префикс /api снимается
  if (req.method === 'POST' && req.url === '/v1/text/inspect') {
    try {
      const body = await readJsonBody(req)
      const text = body?.text

      if (typeof text !== 'string') {
        sendJson(res, 400, { ok: false, error: 'VALIDATION_ERROR', message: 'Поле text обязательно и должно быть строкой.' })
        return
      }

      const trimmed = text.trim()
      if (!trimmed) {
        sendJson(res, 400, { ok: false, error: 'VALIDATION_ERROR', message: 'Поле text не должно быть пустым.' })
        return
      }

      sendJson(res, 200, {
        ok: true,
        data: {
          textLength: trimmed.length,
          wordCount: countWords(trimmed),
          preview: trimmed.slice(0, 120),
        },
      })
      return
    } catch (err) {
      if (err?.message === 'INVALID_JSON') {
        sendJson(res, 400, { ok: false, error: 'INVALID_JSON', message: 'Некорректный JSON в теле запроса.' })
        return
      }

      if (err?.message === 'PAYLOAD_TOO_LARGE') {
        sendJson(res, 413, { ok: false, error: 'PAYLOAD_TOO_LARGE', message: 'Слишком большой payload.' })
        return
      }

      sendJson(res, 500, { ok: false, error: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера.' })
      return
    }
  }

  sendJson(res, 404, { ok: false, error: 'NOT_FOUND', message: 'Маршрут не найден.' })
})

server.on('error', (err) => {
  if (err?.code === 'EADDRINUSE') {
    process.stderr.write(`PORT_IN_USE ${HOST}:${PORT}. Освободите порт или задайте PORT.\n`)
    process.exit(1)
    return
  }

  process.stderr.write(`SERVER_ERROR ${err?.message ?? 'unknown'}\n`)
  process.exit(1)
})

function shutdown(signal) {
  server.close(() => {
    process.stdout.write(`SHUTDOWN ${signal}\n`)
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

server.listen(PORT, HOST, () => {
  process.stdout.write(`model api placeholder http://${HOST}:${PORT}/health\n`)
})
