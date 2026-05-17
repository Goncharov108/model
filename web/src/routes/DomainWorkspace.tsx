import { useMemo, useState } from 'react'
import type { CanonLayer, CanonSubject } from '../domain/canonDomainModel'
import { collectionsToGraph, graphToCollections } from '../lib/canonDomainOps'
import {
  LAYER_VISIBILITY_OPTIONS,
  SUBJECT_KIND_OPTIONS,
  layerVisibilityLabel,
  subjectKindLabel,
} from '../components/domain/canonDomainLabels'
import { useCanonDomainStore } from '../store/canonDomainStore'
import { AppButton } from '../ui/AppButton'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { SurfaceCard } from '../ui/SurfaceCard'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30'

/** Прототип домена канона-3: слои и субъекты in-memory, без OpenFGA/Keycloak. */
export function DomainWorkspace() {
  const layers = useCanonDomainStore((s) => s.layers)
  const subjects = useCanonDomainStore((s) => s.subjects)
  const relations = useCanonDomainStore((s) => s.relations)
  const addLayer = useCanonDomainStore((s) => s.addLayer)
  const addSubject = useCanonDomainStore((s) => s.addSubject)
  const resetToEmpty = useCanonDomainStore((s) => s.resetToEmpty)

  const graphView = useMemo(
    () => graphToCollections(collectionsToGraph({ layers, subjects, relations })),
    [layers, subjects, relations],
  )

  const [layerLabel, setLayerLabel] = useState('')
  const [layerVisibility, setLayerVisibility] = useState<CanonLayer['visibility']>('private')
  const [layerIdDraft, setLayerIdDraft] = useState('')
  const [subjectLabel, setSubjectLabel] = useState('')
  const [subjectKind, setSubjectKind] = useState<CanonSubject['kind']>('human')
  const [subjectIdDraft, setSubjectIdDraft] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  function onAddLayer() {
    const err = addLayer({
      label: layerLabel,
      visibility: layerVisibility,
      id: layerIdDraft.trim() || undefined,
    })
    if (err) {
      setFormError(err)
      return
    }
    setFormError(null)
    setLayerLabel('')
    setLayerIdDraft('')
  }

  function onAddSubject() {
    const err = addSubject({
      displayLabel: subjectLabel,
      kind: subjectKind,
      id: subjectIdDraft.trim() || undefined,
    })
    if (err) {
      setFormError(err)
      return
    }
    setFormError(null)
    setSubjectLabel('')
    setSubjectIdDraft('')
  }

  const isEmpty =
    graphView.layers.length === 0 &&
    graphView.subjects.length === 0 &&
    graphView.relations.length === 0

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <ConfirmDialog
        open={resetOpen}
        title="Очистить домен?"
        description="Все слои, субъекты и отношения в этом браузере будут удалены (model-domain-v1)."
        confirmLabel="Очистить"
        confirmVariant="danger"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          resetToEmpty()
          setFormError(null)
          setResetOpen(false)
        }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Слои" value={graphView.layers.length} />
        <StatCard label="Субъекты" value={graphView.subjects.length} />
        <StatCard label="Отношения" value={graphView.relations.length} hint="только просмотр" />
      </div>

      {isEmpty ? (
        <div
          className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20 px-6 py-10 text-center"
          role="status"
        >
          <p className="text-sm font-medium text-zinc-200">Граф пуст</p>
          <p className="mt-2 text-xs text-zinc-500">
            Начните с формы ниже: добавьте слой видимости и субъекта (человек, агент или сервис).
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard title="Слои" description="Контексты видимости (упрощённая классификация).">
          {graphView.layers.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Слоёв пока нет.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {graphView.layers.map((layer) => (
                <li
                  key={layer.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-zinc-100">{layer.label}</span>
                    <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-200 ring-1 ring-violet-500/25">
                      {layerVisibilityLabel(layer.visibility)}
                    </span>
                  </div>
                  <code className="mt-1 block text-[10px] text-zinc-500">{layer.id}</code>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard title="Субъекты" description="Участники доступа: люди, агенты, сервисы.">
          {graphView.subjects.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Субъектов пока нет.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {graphView.subjects.map((subject) => (
                <li
                  key={subject.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-zinc-100">{subject.displayLabel}</span>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                      {subjectKindLabel(subject.kind)}
                    </span>
                  </div>
                  <code className="mt-1 block text-[10px] text-zinc-500">{subject.id}</code>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </div>

      {graphView.relations.length > 0 ? (
        <SurfaceCard title="Отношения" description="ReBAC-заготовка; добавление в UI — позже.">
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {graphView.relations.map((rel) => (
              <li key={rel.id} className="font-mono text-xs">
                {rel.fromSubjectId} —{rel.kind}→ {rel.toSubjectId}
              </li>
            ))}
          </ul>
        </SurfaceCard>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard title="Добавить слой">
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              onAddLayer()
            }}
          >
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Название
              <input
                className={inputClass}
                value={layerLabel}
                onChange={(e) => setLayerLabel(e.target.value)}
                placeholder="Например: Семейный контекст"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Видимость
              <select
                className={inputClass}
                value={layerVisibility}
                onChange={(e) => setLayerVisibility(e.target.value as CanonLayer['visibility'])}
              >
                {LAYER_VISIBILITY_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {layerVisibilityLabel(v)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              id (необязательно)
              <input
                className={inputClass}
                value={layerIdDraft}
                onChange={(e) => setLayerIdDraft(e.target.value)}
                placeholder="Авто, если пусто"
              />
            </label>
            <AppButton type="submit">Добавить слой</AppButton>
          </form>
        </SurfaceCard>

        <SurfaceCard title="Добавить субъекта">
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              onAddSubject()
            }}
          >
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Подпись
              <input
                className={inputClass}
                value={subjectLabel}
                onChange={(e) => setSubjectLabel(e.target.value)}
                placeholder="Например: Владелец"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Вид
              <select
                className={inputClass}
                value={subjectKind}
                onChange={(e) => setSubjectKind(e.target.value as CanonSubject['kind'])}
              >
                {SUBJECT_KIND_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {subjectKindLabel(k)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              id (необязательно)
              <input
                className={inputClass}
                value={subjectIdDraft}
                onChange={(e) => setSubjectIdDraft(e.target.value)}
                placeholder="Авто, если пусто"
              />
            </label>
            <AppButton type="submit">Добавить субъекта</AppButton>
          </form>
        </SurfaceCard>
      </section>

      {formError ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-6">
        <AppButton type="button" variant="danger" onClick={() => setResetOpen(true)}>
          Очистить домен…
        </AppButton>
      </div>
    </div>
  )
}

/** Компактная метрика в шапке экрана домена. */
function StatCard(props: { label: string; value: number; hint?: string }) {
  const { label, value, hint } = props
  return (
    <SurfaceCard className="!p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-50">{value}</p>
      {hint ? <p className="mt-1 text-[10px] text-zinc-600">{hint}</p> : null}
    </SurfaceCard>
  )
}
