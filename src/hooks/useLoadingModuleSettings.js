import { useEffect, useState } from 'react'
import { settingsApi } from '@/data/settingsApi'

const cache = { data: null, fetched: false }

/**
 * Hook to check if the loading module animation is enabled for a given role.
 * Fetches global settings once and caches the result.
 * @param {'admin' | 'operator' | 'qcTechnician' | 'user'} role
 * @returns {boolean}
 */
export function useLoadingModuleSetting(role) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (cache.fetched) {
        setEnabled(cache.data?.[role] ?? true)
        return
      }
      try {
        const settings = await settingsApi.getSettings()
        const lm = settings?.systemAdmin?.loadingModule ?? settings?.loadingModule ?? {}
        cache.data = lm
        cache.fetched = true
        setEnabled(lm[role] ?? true)
      } catch {
        // Default to showing animation if settings fetch fails
      }
    }
    load()
  }, [role])

  return enabled
}

/** Call this after saving settings to bust the cache */
export function invalidateLoadingModuleCache() {
  cache.data = null
  cache.fetched = false
}
