import { buildOrchestraExport } from './orchestraSnapshot'
import { buildPlanningExport } from './planningSnapshot'
import { useAnalysisSessionStore } from '../store/analysisSessionStore'
import { useOrchestraStore } from '../store/orchestraStore'
import { usePlanningAnswersStore } from '../store/planningAnswersStore'
import { useStreamWorkspaceStore } from '../store/streamWorkspaceStore'

export type WorkspaceBrowserSnapshotV1 = {
  version: 1
  exportedAt: string
  note: string
  stream: { masterRawText: string }
  analysis: {
    local: ReturnType<typeof useAnalysisSessionStore.getState>['local']
    external: ReturnType<typeof useAnalysisSessionStore.getState>['external']
  }
  planning: ReturnType<typeof buildPlanningExport>
  orchestra: ReturnType<typeof buildOrchestraExport>
}

/** Собирает единый JSON со всем, что лежит в persist-сторах браузера (без private/ с диска). */
export function buildWorkspaceBrowserSnapshot(): WorkspaceBrowserSnapshotV1 {
  const { masterRawText } = useStreamWorkspaceStore.getState()
  const { local, external } = useAnalysisSessionStore.getState()
  const { answers } = usePlanningAnswersStore.getState()
  const orch = useOrchestraStore.getState()
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    note: 'Только данные из этого браузера (localStorage). Мастер-текст из private/ сюда не подмешивается автоматически.',
    stream: { masterRawText },
    analysis: { local, external },
    planning: buildPlanningExport(answers),
    orchestra: buildOrchestraExport({
      agents: orch.agents,
      tickets: orch.tickets,
      conductorNotes: orch.conductorNotes,
    }),
  }
}
