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

/** Элементы навигации «Продвинутые настройки» (бывший верхний бар). */
export const ADVANCED_SETTINGS_NAV = [
  { to: PATH.masterAdmin.advanced.stream, label: 'Поток', end: true },
  { to: PATH.masterAdmin.advanced.structures, label: 'Структуры из промптов' },
  { to: PATH.masterAdmin.advanced.plan, label: 'План: вопросы' },
  { to: PATH.masterAdmin.advanced.orchestra, label: 'Оркестр' },
  { to: PATH.masterAdmin.advanced.domain, label: 'Домен' },
  { to: PATH.masterAdmin.advanced.help, label: 'Справка' },
] as const

/** Вкладки боковой панели «Мастер-админ». */
export const MASTER_ADMIN_NAV = [
  { to: PATH.masterAdmin.overview, label: 'Обзор' },
  { to: PATH.masterAdmin.environment, label: 'Окружение' },
  { to: PATH.masterAdmin.users, label: 'Пользователи' },
  { to: PATH.masterAdmin.advanced.root, label: 'Продвинутые настройки' },
] as const

/** Вкладки главного бокового меню. */
export const MAIN_APP_NAV = [{ to: PATH.home, label: 'Главная', end: true }] as const
