import { Link } from 'react-router-dom'
import { PATH } from '../lib/appPaths'
import { appUserRoleLabel } from '../lib/appUserLabels'
import { canAccessAdmin } from '../lib/authAccess'
import { useAuthStore } from '../store/authStore'
import { PageHeader } from '../ui/PageHeader'
import { AppButton } from '../ui/AppButton'

/** Главная после входа. */
export function HomeWorkspace() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Главная"
        title={user ? `Здравствуйте, ${user.displayName}` : 'Добро пожаловать'}
        description={
          user
            ? `Вы вошли как ${user.email}. Роли: ${user.roles.map(appUserRoleLabel).join(', ')}.`
            : 'Войдите через Google, чтобы открыть рабочее место.'
        }
      />
      <div className="flex flex-wrap gap-3">
        <Link to={PATH.account}>
          <AppButton type="button">Настройки аккаунта</AppButton>
        </Link>
        <Link to={PATH.masterAdmin.advanced.stream}>
          <AppButton type="button" variant="ghost">
            Продвинутые настройки
          </AppButton>
        </Link>
        {user && canAccessAdmin(user) ? (
          <Link to={PATH.adminUsers}>
            <AppButton type="button" variant="ghost">
              Пользователи
            </AppButton>
          </Link>
        ) : null}
      </div>
    </div>
  )
}
