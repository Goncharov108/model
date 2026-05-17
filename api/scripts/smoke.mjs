import net from 'node:net'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

async function findFreePort() {
  return await new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.once('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address()
      if (!address || typeof address === 'string') {
        reject(new Error('Не удалось получить свободный порт'))
        return
      }
      const { port } = address
      srv.close((err) => (err ? reject(err) : resolve(port)))
    })
  })
}

async function wait(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

async function fetchHealth(port) {
  const response = await fetch(`http://127.0.0.1:${port}/health`)
  if (!response.ok) throw new Error(`health HTTP ${response.status}`)
  const json = await response.json()
  if (json?.ok !== true) throw new Error('health: поле ok !== true')
  return json
}

async function fetchInspect(port) {
  const response = await fetch(`http://127.0.0.1:${port}/api/v1/text/inspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Привет мир из smoke теста' }),
  })
  if (!response.ok) throw new Error(`inspect HTTP ${response.status}`)

  const json = await response.json()
  if (json?.ok !== true) throw new Error('inspect: поле ok !== true')
  if (typeof json?.data?.wordCount !== 'number' || json.data.wordCount < 1) {
    throw new Error('inspect: некорректный wordCount')
  }
  return json
}

const port = await findFreePort()
const apiDir = fileURLToPath(new URL('..', import.meta.url))
const child = spawn(process.execPath, ['server.mjs'], {
  cwd: apiDir,
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
})

let stderr = ''
child.stderr.on('data', (chunk) => {
  stderr += String(chunk)
})

try {
  let lastErr
  for (let i = 0; i < 20; i += 1) {
    try {
      const health = await fetchHealth(port)
      const inspect = await fetchInspect(port)
      process.stdout.write(`SMOKE_OK ${JSON.stringify({ health, inspect })}\n`)
      child.kill('SIGTERM')
      process.exit(0)
    } catch (err) {
      lastErr = err
      await wait(100)
    }
  }

  throw new Error(`Smoke-check не прошёл: ${lastErr?.message ?? 'unknown error'}`)
} catch (err) {
  child.kill('SIGTERM')
  process.stderr.write(`${err.message}\n`)
  if (stderr) process.stderr.write(stderr)
  process.exit(1)
}
