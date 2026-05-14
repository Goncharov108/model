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
  {
    id: 'seed-dry-methods',
    title: 'Повтор алгоритма → отдельный метод',
    summary:
      'Если один и тот же алгоритм повторяется больше двух раз — выносить в именованную функцию/метод с кратким описанием.',
    tags: ['code-quality', 'process'],
    sourceHint: 'Промпт: правило про повторяющиеся алгоритмы',
    createdAtIso: '2026-05-15T14:00:00.000Z',
  },
  {
    id: 'seed-deep-analysis-ui',
    title: 'Глубокий анализ и веб-структуры',
    summary:
      'Фундаментальный текст разбираем максимально глубоко (модель/агент); результат — структуры в UI для корректировки и исследования; тот же пайплайн для файлов вроде private/USER_PRIVATE_TEXT.txt.',
    tags: ['analysis', 'ui', 'research'],
    sourceHint: 'Промпт: фундаментальный текст и инструменты анализа',
    createdAtIso: '2026-05-15T14:00:00.000Z',
  },
  {
    id: 'seed-analysis-tooling',
    title: 'Инструменты анализа в web/src/analysis',
    summary:
      'Конвейер runAnalysisPipeline, метрики, блоки, ключевые слова; импорт JSON ExternalAnalysisV1; персистентность zustand persist.',
    tags: ['analysis', 'architecture'],
    sourceHint: 'Промпт: создать подходящие инструменты',
    createdAtIso: '2026-05-15T14:00:00.000Z',
  },
  {
    id: 'seed-master-text-law-11',
    title: 'Мастер-текст как откровение и закон намерения',
    summary:
      'Поток объявлён откровением и законом продукта; хранение только локально (private/MASTER_TEXT.txt); в Git не коммитить; приоритет при спорных трактовках до явного обновления владельцем.',
    tags: ['master', 'governance', 'privacy'],
    sourceHint: 'Мастер-текст пользователя (2026-05-15)',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-product-layers-social',
    title: 'Мастер-админка, публичная часть и «соцсеть для своих»',
    summary:
      'Роли главного админа и круга близких; многослойная видимость; идея клонов; гостеприимство как этика сервиса.',
    tags: ['product', 'roles', 'social'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-monetization-gifted-layers',
    title: 'Оплата, подаренные слои и саморегуляция личной информации',
    summary:
      'Платные разделы; «своим» можно открывать по умолчанию; клиент видит бизнес-связки только если владелец явно открыл; календарь и события — по выбору.',
    tags: ['product', 'billing', 'privacy'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-team-dev-sales',
    title: 'Команда (я, Дима, Паша, Стас) и первая бизнес-цель — продажник',
    summary:
      'Разные админки/слои под роли; ветки задач для помощников без давления; честная самооценка; интерес к проектам и коллегиальное вето; первый фокус — сильный sales.',
    tags: ['team', 'gtm', 'process'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-two-repos-deploy-day1',
    title: 'Два репозитория и деплой с первого дня',
    summary: 'Бек и фронт раздельно (навык Паши); выкладка на сервер сразу, чтобы не расползался прототип.',
    tags: ['engineering', 'devops'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-landing-privacy-ritual',
    title: 'Лендинг: подписка, радикальное согласие и политика, которая отговаривает',
    summary:
      'Идеальный лендинг — форма подписки; жёсткая кнопка согласия; политика честно про стек и риски; фактически только заявка и решение после собеседования.',
    tags: ['ux', 'legal', 'privacy'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-teacher-reporting-layer',
    title: 'Слой отчётности для наставника (Ватсала прабху)',
    summary:
      'Интерактивные отчёты из жизни и медиа; вопросы; отдельная админка; выбор слоёв доступа со стороны наставника.',
    tags: ['product', 'reporting', 'spiritual'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-life-os-ingestion',
    title: 'Life-OS: поток входящих, календарь, телега, документы',
    summary:
      'Не «просто календарь», а пространство под выросший поток информации; реальное расписание; телега как вход; согласия и репозитории пользователя.',
    tags: ['product', 'calendar', 'telegram'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-opensource-threat-model',
    title: 'Опенсорс и честная модель утечек',
    summary:
      'Открытый репозиторий и изолированные группы; сомнение в полной изоляции; документировать источники утечек; несогласный не пользуется сервисом.',
    tags: ['opensource', 'security', 'privacy'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-spiritual-layer-goals',
    title: 'Духовный слой, гиперфокус и крупные цели',
    summary:
      'Анартхи, дурные мысли, план; гиперфокус на инициации; работа 2–3 дня, ~5M; совместное служение; масштабное мероприятие/киртан; перспектива «макета вселенной».',
    tags: ['spiritual', 'goals', 'product'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-mvp-ingest-agents',
    title: 'MVP: заметки и почта, Obsidian/Hermes, агент web+Telegram, веды позже',
    summary:
      'Первая техническая задача — разобрать заметки и почту; интеграции; агент через веб и телеграм; далее аналитика ведических текстов.',
    tags: ['mvp', 'agents', 'integrations'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-salesperson-layered-job',
    title: 'Продажник: многослойные вакансии и доля от пирога',
    summary:
      'Разные тексты вакансии по слоям; жёсткие требования; ценность — «Фёдор готов платить X»; зарплата не гарантируется; этика и продажи на собеседовании.',
    tags: ['sales', 'hr', 'compensation'],
    sourceHint: 'Мастер-текст',
    createdAtIso: '2026-05-15T19:10:00.000Z',
  },
  {
    id: 'seed-planning-questionnaire-ui',
    title: 'Опросник плана (варианты + свой текст)',
    summary:
      'Вкладка «План: вопросы» (/plan): перманентный список вопросов с radio и полем «свой вариант», ответы в localStorage (model-planning-v1).',
    tags: ['ui', 'planning', 'product'],
    sourceHint: 'Промпт: встроенные списки с вариантами и перманентные вопросы',
    createdAtIso: '2026-05-15T20:00:00.000Z',
  },
  {
    id: 'seed-canon2-repo',
    title: 'Канон-2 в репозитории (PDF → CANON_SECONDARY_MASTER.txt)',
    summary:
      'Второй по важности текст в Git: извлечение из PDF «Мастер как многослойная private social operating system»; связка с SWOD закон 3.',
    tags: ['canon', 'governance', 'docs'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-dual-os',
    title: 'Личная OS: два фасада и слои видимости',
    summary:
      'Не CRM: операционная система отношений/памяти/доступа; каждый видит свой слой; публичный и приватный контуры.',
    tags: ['architecture', 'product', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-commodity',
    title: 'Commodity-слои vs уникальное ядро',
    summary:
      'Не переписывать календарь/чат ради галочки; уникальны слой раскрытия, гость у хозяина, проекции и политика раскрытия.',
    tags: ['architecture', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-bounded',
    title: 'Bounded contexts (публичный, личный, семья, команда, бизнес, наставник, дух, посёлок)',
    summary:
      'Контуры не смешивать в одну таблицу «профиля»; отдельные продуктовые области с разными владельцами раскрытия.',
    tags: ['ddd', 'architecture', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-initiation',
    title: 'Инициация вместо SaaS-signup',
    summary:
      'Цепочка: публичный вход → заявка → собеседование → базовый слой → расширение по доверию/оплате/решениям владельца.',
    tags: ['ux', 'product', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-ingest',
    title: 'Ingest-first ядро',
    summary:
      'Строить от входящего потока: заметка, письмо, сообщение, медиа, событие, задача, мысль, отчёт — затем разнесение по слоям и людям.',
    tags: ['pipeline', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-agents',
    title: 'Агенты/клоны как отдельный тип субъекта',
    summary:
      'Не маскировать клон под человека; делегированные полномочия; связка с OpenFGA/Keycloak сценариями для агентов и MCP.',
    tags: ['security', 'authz', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-projections',
    title: 'Канонический объект и управляемые проекции',
    summary:
      'Один источник правды и разные проекции в семейный, рабочий и отчётный слои с разной видимостью полей и вложений.',
    tags: ['data-model', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-authz',
    title: 'RBAC + ABAC + ReBAC + PostgreSQL RLS',
    summary:
      'Гибрид моделей доступа; RLS как последняя линия при багах API; deny by default; осторожность с service keys, обходящими RLS.',
    tags: ['authz', 'postgres', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-subjects',
    title: 'Каталог типов субъектов (root…guest, sales, community, agent)',
    summary:
      'Доступ = роль + отношение + слой + срок + объём полей; не «роль навсегда»; рекомендуемые роли для ключевых людей в тексте канона.',
    tags: ['authz', 'roles', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-two-tempo',
    title: 'Два темпа поставки',
    summary:
      'Быстрый старт на сервере в первый день и параллельное выращивание уникального ядра, переживающего смену модулей.',
    tags: ['process', 'devops', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-stack',
    title: 'Опорный стек: HumHub, Keycloak, OpenFGA, Postgres+RLS, Nextcloud, Obsidian, Telegram, Ollama, Matrix позже',
    summary:
      'Сборка зрелых модулей под self-hosted; разные админ-консоли поверх одного identity; локальные модели для чувствительного анализа.',
    tags: ['stack', 'self-hosted', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-metadata',
    title: 'Метаданные объекта и политики хранения',
    summary:
      'Поля owner/layer/visibility/relation/billing/sensitivity/consent/retention/audit; политика по умолчанию — отказ без явного правила.',
    tags: ['data-model', 'privacy', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-disclosure',
    title: 'Двухступенчатое раскрытие (факт → содержание)',
    summary:
      'Для семьи, духовного контура и наставника: сначала факт существования события/заметки, затем содержание по отдельному разрешению.',
    tags: ['ux', 'privacy', 'canon2'],
    sourceHint: 'CANON_SECONDARY_MASTER.txt',
    createdAtIso: '2026-05-15T22:00:00.000Z',
  },
  {
    id: 'seed-canon2-bundled-json',
    title: 'Встроенный JSON анализа канона-2 в UI',
    summary:
      'Файл web/src/data/canonSecondaryExternalAnalysis.v1.json; кнопка «Канон-2 (PDF) в слой» на вкладке «Поток» подгружает внешний анализ без ручного копирования.',
    tags: ['ui', 'analysis', 'canon2'],
    sourceHint: 'Запрос пользователя: разнести канон и JSON',
    createdAtIso: '2026-05-15T22:30:00.000Z',
  },
]
