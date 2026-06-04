import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'

/** true после чтения model-auth-v1 из localStorage (иначе persist затирает свежий вход). */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
