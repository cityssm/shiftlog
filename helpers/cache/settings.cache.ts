import getSettingsFromDatabase from '../../database/app/getSettings.js'
import type { Setting } from '../../types/record.types.js'
import type {
  SettingKey,
  SettingProperties
} from '../../types/setting.types.js'

let settings: Array<Partial<Setting> & SettingProperties> | undefined

export async function getCachedSettings(): Promise<
  Array<Partial<Setting> & SettingProperties>
> {
  settings ??= await getSettingsFromDatabase()
  return settings
}

export async function getCachedSetting(
  settingKey: SettingKey
): Promise<(Partial<Setting> & SettingProperties) | undefined> {
  const cachedSettings = await getCachedSettings()

  return cachedSettings.find(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (setting) => setting.settingKey === settingKey
  ) as Partial<Setting> & SettingProperties
}

export async function getCachedSettingValue(
  settingKey: SettingKey
): Promise<string> {
  const setting = await getCachedSetting(settingKey)

  if (setting === undefined) {
    return ''
  }

  let settingValue = setting.settingValue ?? ''

  if (settingValue === '') {
    settingValue = setting.defaultValue
  }

  return settingValue
}

export function clearSettingsCache(): void {
  settings = undefined
}
