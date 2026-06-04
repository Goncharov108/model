import { Navigate } from 'react-router-dom'
import { PATH } from '../lib/appPaths'

/** Пользователи перенесены в админ-панель. */
export function MasterAdminUsersWorkspace() {
  return <Navigate to={PATH.adminUsers} replace />
}
