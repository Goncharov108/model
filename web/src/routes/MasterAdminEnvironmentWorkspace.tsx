import type { JSX } from 'react'
import { useState } from 'react'
import { EnvironmentStackTable } from '../components/environment/EnvironmentStackTable'
import type { EnvironmentStackTier } from '../domain/environmentDocs'
import {
  buildDeployChecklistText,
  buildEnvironmentDocsExport,
  parseEnvironmentDocsImport,
} from '../lib/environmentDocsSnapshot'
import { downloadJson } from '../lib/downloadJson'
import { useEnvironmentDocsStore } from '../store/environmentDocsStore'
import { AppButton } from '../ui/AppButton'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30'

const STACK_TIERS: EnvironmentStackTier[] = ['production', 'repository', 'planned']

/** Поле подписи + input/textarea для секций «Окружение». */
function EnvField(props: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  type?: string
  placeholder?: string
}) {
  const { label, value, onChange, multiline, type = 'text', placeholder } = props
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-500">
      {label}
      {multiline ? (
        <textarea
          className={`${inputClass} min-h-[4.5rem] font-mono text-xs`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={inputClass}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  )
}

/** Вкладка «Окружение»: документация стека, CI, DNS, сервер (persist + экспорт JSON). */
export function MasterAdminEnvironmentWorkspace(): JSX.Element {
  const docs = useEnvironmentDocsStore((s) => s.docs)
  const patchGithub = useEnvironmentDocsStore((s) => s.patchGithub)
  const patchDomain = useEnvironmentDocsStore((s) => s.patchDomain)
  const patchServer = useEnvironmentDocsStore((s) => s.patchServer)
  const patchSecrets = useEnvironmentDocsStore((s) => s.patchSecrets)
  const setPlannedCanonRef = useEnvironmentDocsStore((s) => s.setPlannedCanonRef)
  const updateStackRow = useEnvironmentDocsStore((s) => s.updateStackRow)
  const addStackRow = useEnvironmentDocsStore((s) => s.addStackRow)
  const removeStackRow = useEnvironmentDocsStore((s) => s.removeStackRow)
  const replaceAll = useEnvironmentDocsStore((s) => s.replaceAll)
  const resetToDefaults = useEnvironmentDocsStore((s) => s.resetToDefaults)

  const [importDraft, setImportDraft] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [clipboardMsg, setClipboardMsg] = useState<string | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  function onExport() {
    downloadJson(`model-environment-${Date.now()}.json`, buildEnvironmentDocsExport(docs))
    setImportError(null)
  }

  function onImport() {
    const res = parseEnvironmentDocsImport(importDraft)
    if (!res.ok) {
      setImportError(res.message)
      return
    }
    replaceAll(res.docs)
    setImportError(null)
    setImportDraft('')
  }

  async function onCopyChecklist() {
    const text = buildDeployChecklistText(docs)
    try {
      await navigator.clipboard.writeText(text)
      setClipboardMsg('Чеклист скопирован в буфер')
    } catch {
      setClipboardMsg('Не удалось скопировать — разрешите доступ к буферу')
    }
    setTimeout(() => setClipboardMsg(null), 3000)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <ConfirmDialog
        open={resetOpen}
        title="Сбросить документацию окружения?"
        description="Поля вернутся к шаблону из репозитория. Текущие правки в этом браузере пропадут."
        confirmLabel="Сбросить"
        confirmVariant="danger"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          resetToDefaults()
          setImportError(null)
          setResetOpen(false)
        }}
      />

      <PageHeader
        eyebrow="Мастер-админ"
        title="Окружение"
        description="Единое место для стека, CI, домена reg.ru и сервера. Данные — model-environment-docs-v1 в браузере; зеркало без секретов — docs/environment/ в Git. Пароли и ключи сюда не вносить."
      />

      <SurfaceCard
        title="Репозиторий и CI"
        description="После push укажите URL. Workflow: .github/workflows/ci.yml (lint, test, build, api-smoke)."
      >
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <EnvField
            label="URL GitHub"
            value={docs.github.repoUrl}
            onChange={(repoUrl) => patchGithub({ repoUrl })}
            placeholder="https://github.com/…/model"
          />
          <EnvField
            label="Имя репозитория"
            value={docs.github.repoName}
            onChange={(repoName) => patchGithub({ repoName })}
          />
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Видимость
            <select
              className={inputClass}
              value={docs.github.visibility}
              onChange={(e) =>
                patchGithub({
                  visibility: e.target.value as typeof docs.github.visibility,
                })
              }
            >
              <option value="">—</option>
              <option value="private">private</option>
              <option value="public">public</option>
            </select>
          </label>
          <EnvField
            label="Ветка по умолчанию"
            value={docs.github.defaultBranch}
            onChange={(defaultBranch) => patchGithub({ defaultBranch })}
          />
          <EnvField
            label="Workflow CI"
            value={docs.github.ciWorkflow}
            onChange={(ciWorkflow) => patchGithub({ ciWorkflow })}
          />
          <EnvField
            label="Статус CI"
            value={docs.github.ciStatus}
            onChange={(ciStatus) => patchGithub({ ciStatus })}
          />
          <div className="sm:col-span-2">
            <EnvField
              label="Заметки"
              value={docs.github.notes}
              onChange={(notes) => patchGithub({ notes })}
              multiline
            />
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard title="Домен (reg.ru)" description="DNS и SSL; API-ключ reg.ru — только локально, не в Git.">
        <div className="mt-4 grid gap-3">
          <EnvField
            label="Доменное имя"
            value={docs.domain.domainName}
            onChange={(domainName) => patchDomain({ domainName })}
            placeholder="example.ru"
          />
          <EnvField
            label="DNS-записи (A / AAAA / CNAME)"
            value={docs.domain.dnsRecords}
            onChange={(dnsRecords) => patchDomain({ dnsRecords })}
            multiline
          />
          <EnvField
            label="Статус SSL"
            value={docs.domain.sslStatus}
            onChange={(sslStatus) => patchDomain({ sslStatus })}
          />
          <EnvField
            label="Дата проверки SSL"
            value={docs.domain.sslCheckedAt}
            onChange={(sslCheckedAt) => patchDomain({ sslCheckedAt })}
            type="date"
          />
          <div className="sm:col-span-2">
            <EnvField
              label="Заметки"
              value={docs.domain.notes}
              onChange={(notes) => patchDomain({ notes })}
              multiline
            />
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard title="Сервер" description="Без паролей. SSH — только ключи.">
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <EnvField
            label="Хост (IP или hostname)"
            value={docs.server.host}
            onChange={(host) => patchServer({ host })}
          />
          <EnvField label="ОС" value={docs.server.os} onChange={(os) => patchServer({ os })} />
          <EnvField
            label="SSH-пользователь"
            value={docs.server.sshUser}
            onChange={(sshUser) => patchServer({ sshUser })}
          />
          <EnvField
            label="Node на сервере"
            value={docs.server.nodeVersion}
            onChange={(nodeVersion) => patchServer({ nodeVersion })}
          />
          <EnvField
            label="Путь статики (web/dist)"
            value={docs.server.deployWebPath}
            onChange={(deployWebPath) => patchServer({ deployWebPath })}
          />
          <EnvField
            label="Путь API"
            value={docs.server.deployApiPath}
            onChange={(deployApiPath) => patchServer({ deployApiPath })}
          />
          <div className="sm:col-span-2">
            <EnvField
              label="Заметки"
              value={docs.server.notes}
              onChange={(notes) => patchServer({ notes })}
              multiline
            />
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="Стек приложения"
        description="Слой | технология | версия | где | заметка. Перспектива канона-3 — блок «Запланировано»."
      >
        <div className="mt-4 space-y-6">
          {STACK_TIERS.map((tier) => (
            <EnvironmentStackTable
              key={tier}
              rows={docs.stack.rows}
              tier={tier}
              onUpdate={updateStackRow}
              onAdd={() => addStackRow(tier)}
              onRemove={removeStackRow}
            />
          ))}
          <EnvField
            label="Ссылка на канон-3 (запланировано)"
            value={docs.stack.plannedCanonRef}
            onChange={setPlannedCanonRef}
            multiline
          />
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="Секреты и границы"
        description="Что никогда не коммитить и куда класть на сервере."
      >
        <div className="mt-4 space-y-3">
          <EnvField
            label="Никогда в Git"
            value={docs.secrets.neverCommit}
            onChange={(neverCommit) => patchSecrets({ neverCommit })}
            multiline
          />
          <EnvField
            label="На сервере / в Secrets"
            value={docs.secrets.serverSecrets}
            onChange={(serverSecrets) => patchSecrets({ serverSecrets })}
            multiline
          />
          <EnvField
            label="Заметки"
            value={docs.secrets.notes}
            onChange={(notes) => patchSecrets({ notes })}
            multiline
          />
        </div>
      </SurfaceCard>

      <SurfaceCard title="Экспорт и импорт" description="JSON version 1 — перенос между машинами и в чат ассистенту.">
        <div className="mt-4 flex flex-wrap gap-2">
          <AppButton type="button" onClick={onExport}>
            Экспорт JSON
          </AppButton>
          <AppButton type="button" variant="ghost" onClick={onCopyChecklist}>
            Скопировать чеклист деплоя
          </AppButton>
          <AppButton type="button" variant="ghost" onClick={() => setResetOpen(true)}>
            Сброс к шаблону
          </AppButton>
        </div>
        {clipboardMsg ? <p className="mt-2 text-sm text-emerald-400/90">{clipboardMsg}</p> : null}
        <label className="mt-4 flex flex-col gap-1 text-xs text-zinc-500">
          Вставьте JSON для импорта
          <textarea
            className={`${inputClass} min-h-[8rem] font-mono text-xs`}
            value={importDraft}
            onChange={(e) => setImportDraft(e.target.value)}
            placeholder='{"version":1,"docs":{...}}'
          />
        </label>
        {importError ? <p className="mt-2 text-sm text-red-400">{importError}</p> : null}
        <AppButton type="button" className="mt-3" onClick={onImport}>
          Импорт JSON
        </AppButton>
        <p className="mt-4 text-xs text-zinc-500">
          Зеркало в репозитории: docs/environment/ (README, STACK, GITHUB, DNS_REG_RU, SERVER, DEPLOY).
        </p>
      </SurfaceCard>
    </div>
  )
}
