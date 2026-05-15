import { describe, expect, it } from 'vitest'
import { createDefaultEnvironmentDocs } from '../data/environmentDocsDefaults'
import {
  buildDeployChecklistText,
  buildEnvironmentDocsExport,
  parseEnvironmentDocsImport,
} from './environmentDocsSnapshot'

describe('environmentDocsSnapshot', () => {
  it('parseEnvironmentDocsImport отклоняет невалидный JSON', () => {
    const r = parseEnvironmentDocsImport('not json')
    expect(r.ok).toBe(false)
  })

  it('roundtrip документации окружения', () => {
    const docs = createDefaultEnvironmentDocs()
    docs.github.repoUrl = 'https://github.com/example/model'
    const json = JSON.stringify(buildEnvironmentDocsExport(docs))
    const r = parseEnvironmentDocsImport(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.docs.github.repoUrl).toBe('https://github.com/example/model')
    expect(r.docs.stack.rows.length).toBe(docs.stack.rows.length)
  })

  it('buildDeployChecklistText содержит пути деплоя', () => {
    const docs = createDefaultEnvironmentDocs()
    docs.server.deployWebPath = '/var/www/test'
    const text = buildDeployChecklistText(docs)
    expect(text).toContain('/var/www/test')
    expect(text).toContain('docs/environment/')
  })
})
