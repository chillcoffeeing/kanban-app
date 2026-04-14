import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

export function useApplySettings() {
  const { theme, background, density, reducedMotion, language } =
    useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.dataset.density = density
    root.dataset.reducedMotion = String(reducedMotion)
    root.lang = language
    document.body.dataset.bg = background
  }, [theme, background, density, reducedMotion, language])
}
