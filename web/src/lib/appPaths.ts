/** Маршруты приложения (единый источник для навигации). */
export const PATH = {
  home: '/',
  account: '/account',
  admin: '/admin',
  masterAdmin: {
    root: '/master-admin',
    overview: '/master-admin/overview',
    environment: '/master-admin/environment',
    users: '/master-admin/users',
    philosophy: '/master-admin/philosophy',
    hermes: '/master-admin/hermes',
    advanced: {
      root: '/master-admin/advanced',
      stream: '/master-admin/advanced',
      structures: '/master-admin/advanced/structures',
      plan: '/master-admin/advanced/plan',
      orchestra: '/master-admin/advanced/orchestra',
      domain: '/master-admin/advanced/domain',
      help: '/master-admin/advanced/help',
    },
  },
} as const

/** Разделы «Продвинутые настройки» — навигация внутри контента. */
export const ADVANCED_SETTINGS_NAV = [
  {
    to: PATH.masterAdmin.advanced.stream,
    label: 'Поток',
    hint: 'Текст сознания, локальный и внешний анализ',
    end: true as const,
  },
  {
    to: PATH.masterAdmin.advanced.structures,
    label: 'Структуры',
    hint: 'Реестр из промптов, заметки, связь с потоком',
  },
  {
    to: PATH.masterAdmin.advanced.plan,
    label: 'План',
    hint: 'Опросник и экспорт ответов в JSON',
  },
  {
    to: PATH.masterAdmin.advanced.orchestra,
    label: 'Оркестр',
    hint: 'Роли агентов и задачи для IDE',
  },
  {
    to: PATH.masterAdmin.advanced.domain,
    label: 'Домен',
    hint: 'Слои и субъекты канона-3 (прототип)',
  },
  {
    to: PATH.masterAdmin.advanced.help,
    label: 'Справка',
    hint: 'Онбординг и ссылка на UI_OVERVIEW',
  },
] as const

/** Вкладки боковой панели «Мастер-админ». */
export const MASTER_ADMIN_NAV = [
  { to: PATH.masterAdmin.overview, label: 'Обзор' },
  { to: PATH.masterAdmin.environment, label: 'Окружение' },
  { to: PATH.masterAdmin.users, label: 'Пользователи' },
  { to: PATH.masterAdmin.philosophy, label: 'Философия' },
  { to: PATH.masterAdmin.hermes, label: 'Hermes' },
  { to: PATH.masterAdmin.advanced.root, label: 'Продвинутые настройки' },
] as const

/** Вкладки главного бокового меню. */
export const MAIN_APP_NAV = [{ to: PATH.home, label: 'Главная', end: true }] as const

/** Текущий раздел advanced по pathname. */
export function getAdvancedNavItem(pathname: string) {
  return (
    ADVANCED_SETTINGS_NAV.find((item) =>
      'end' in item && item.end
        ? pathname === item.to || pathname === `${item.to}/`
        : pathname.startsWith(item.to),
    ) ?? ADVANCED_SETTINGS_NAV[0]
  )
}
