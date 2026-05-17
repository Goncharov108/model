import http from 'node:http'

const PORT = Number(process.env.PORT) || 3847
const HOST = process.env.HOST || '127.0.0.1'

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: true, service: 'model-api-placeholder', version: '0.1.0' }))
    return
  }

  res.statusCode = 404
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end('Not found')
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
