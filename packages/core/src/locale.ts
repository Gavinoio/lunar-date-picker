import type { PickerLocale } from './types'

export const DEFAULT_PICKER_LOCALE: Required<PickerLocale> = {
  confirm: '确定',
  cancel: '取消',
  solar: '公历',
  lunar: '农历'
}

export function resolveLocale(locale?: PickerLocale): Required<PickerLocale> {
  const resolved = { ...DEFAULT_PICKER_LOCALE }
  if (!locale) return resolved

  for (const key of Object.keys(locale) as Array<keyof PickerLocale>) {
    const value = locale[key]
    if (value !== undefined) {
      resolved[key] = value
    }
  }

  return resolved
}
