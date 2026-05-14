import type { PromptStructureItem } from '../domain/promptStructure'

/** Начальный реестр структур, явно выделенных в подтверждённых промптах (пополняется по мере работы). */
export const DEFAULT_PROMPT_STRUCTURES: PromptStructureItem[] = [
  {
    id: 'seed-private-layer',
    title: 'Личный слой текста (только владелец)',
    summary:
      'Файл private/USER_PRIVATE_TEXT.txt, исключение из Git, PROJECT_LAW, chmod 600; содержимое не в репозитории.',
    tags: ['git', 'privacy', 'private'],
    sourceHint: 'Промпт: локальный проект и личный текст',
    createdAtIso: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'seed-swod',
    title: 'Свод законов (SWOD_ZAKONOV.txt)',
    summary:
      'Единый реестр утверждённых правил; возврат и структурирование позже; история фиксаций.',
    tags: ['governance', 'docs'],
    sourceHint: 'Промпт: свод законов и документация',
    createdAtIso: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'seed-doc-consent',
    title: 'Согласование новых документов',
    summary:
      'Перед созданием нового файла документации — переспросить пользователя, нужен ли такой документ.',
    tags: ['process', 'docs'],
    sourceHint: 'Промпт: правило перед новыми документами',
    createdAtIso: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'seed-agents',
    title: 'Подключение агентов',
    summary:
      'Смело подключать вложенных агентов и автоматизацию, если ускоряет работу и не нарушает private.',
    tags: ['agents', 'process'],
    sourceHint: 'Промпт: не стесняться агентов',
    createdAtIso: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'seed-web-stack',
    title: 'Локальный web-стек (web/)',
    summary:
      'Vite 8, React 19, TypeScript 6, Tailwind 4, react-router-dom 7, zustand, Inter Variable; dev host true.',
    tags: ['web', 'vite', 'react'],
    sourceHint: 'Промпт: окружение под интерфейс структурирования',
    createdAtIso: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'seed-git-node',
    title: 'Воспроизводимость Node',
    summary: 'Корневой .nvmrc → 22; npm из nvm в PATH при сборке и dev.',
    tags: ['node', 'tooling'],
    sourceHint: 'Промпт / настройка окружения',
    createdAtIso: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'seed-ui-tabs',
    title: 'Вкладки интерфейса',
    summary:
      'Отдельная вкладка для разбора структур из промптов; основной поток — на вкладке «Поток».',
    tags: ['ui', 'navigation'],
    sourceHint: 'Промпт: структуры из промптов во вкладке',
    createdAtIso: '2026-05-15T12:00:00.000Z',
  },
  {
    id: 'seed-dev-server-rule',
    title: 'Dev-сервер под контролем ассистента',
    summary:
      'Ассистент сам поднимает Vite dev-сервер и перезапускает при необходимости (конфиг, порт, сбой).',
    tags: ['dev-server', 'process'],
    sourceHint: 'Промпт: сам поднимай и перезагружай сервер',
    createdAtIso: '2026-05-15T12:00:00.000Z',
  },
]
