import type { OrchestraAgent } from '../domain/orchestra'

/** Стартовый набор ролей под типы вложенных агентов Cursor (можно править в UI). */
export const DEFAULT_ORCHESTRA_AGENTS: OrchestraAgent[] = [
  {
    id: 'orch-agent-explore',
    label: 'Исследование (explore)',
    focus: 'Быстрый обзор кода, поиск файлов и символов, только чтение.',
  },
  {
    id: 'orch-agent-general',
    label: 'Общий агент (generalPurpose)',
    focus: 'Сложные цепочки: код, поиск, несколько шагов.',
  },
  {
    id: 'orch-agent-shell',
    label: 'Терминал (shell)',
    focus: 'Git, npm, сборка, скрипты, диагностика окружения.',
  },
  {
    id: 'orch-agent-ci',
    label: 'CI (ci-investigator)',
    focus: 'Разбор одного упавшего проверки PR, краткий отчёт.',
  },
]
