import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseExternalAnalysisJson } from '../analysis/import/parseExternalAnalysisJson'
import { runAnalysisPipeline } from '../analysis/pipeline/runAnalysisPipeline'
import type { ExternalAnalysisV1, LocalAnalysisBundle } from '../domain/analysisTypes'
import { downloadJson } from '../lib/downloadJson'

interface AnalysisSessionState {
  local: LocalAnalysisBundle | null
  external: ExternalAnalysisV1 | null
  importError: string | null
  /** Локальный конвейер (тот же для вставки и загруженного .txt). */
  runLocal: (rawText: string) => void
  /** Импорт JSON глубокого анализа от модели/агента. */
  applyExternalJson: (json: string) => void
  setImportError: (message: string | null) => void
  clear: () => void
  /** Экспорт снимка (сырой текст + слои анализа) для архива/исследования. */
  exportSnapshot: (rawText: string) => void
}

export const useAnalysisSessionStore = create<AnalysisSessionState>()(
  persist(
    (set, get) => ({
      local: null,
      external: null,
      importError: null,
      setImportError: (message) => set({ importError: message }),
      runLocal: (rawText) => {
        const trimmed = rawText.trim()
        if (!trimmed) {
          set({ local: null, importError: null })
          return
        }
        set({ local: runAnalysisPipeline(trimmed), importError: null })
      },
      applyExternalJson: (json) => {
        const res = parseExternalAnalysisJson(json)
        if (!res.ok) {
          set({ importError: res.message, external: null })
          return
        }
        set({ external: res.value, importError: null })
      },
      clear: () => set({ local: null, external: null, importError: null }),
      exportSnapshot: (rawText) => {
        const snapshot = {
          version: 1 as const,
          exportedAt: new Date().toISOString(),
          rawText,
          local: get().local,
          external: get().external,
        }
        downloadJson(`analysis-snapshot-${Date.now()}.json`, snapshot)
      },
    }),
    {
      name: 'model-analysis-v1',
      partialize: (state) => ({ local: state.local, external: state.external }),
    },
  ),
)
