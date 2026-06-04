import { Navigate } from 'react-router-dom'
import { PATH } from '../lib/appPaths'

/** Корень админ-панели → пользователи. */
export function AdminPanelWorkspace() {
  return <Navigate to={PATH.adminUsers} replace />
}
