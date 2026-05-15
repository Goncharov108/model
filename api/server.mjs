import http from 'node:http'

const PORT = Number(process.env.PORT) || 3847

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: true, service: 'model-api-placeholder', version: '0' }))
    return
  }
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end('Not found')
})

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`model api placeholder http://127.0.0.1:${PORT}/health\n`)
})
