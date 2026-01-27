import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Setting } from '../../types/record.types.js'
import {
  type SettingProperties,
  settingProperties
} from '../../types/setting.types.js'

export default async function getSettings(): Promise<
  Array<Partial<Setting> & SettingProperties>
> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<Setting>(/* sql */ `
      SELECT
        s.settingKey,
        s.settingValue,
        s.previousSettingValue,
        s.recordUpdate_dateTime
      FROM
        ShiftLog.ApplicationSettings s
      WHERE
        instance = @instance
    `))

  const databaseSettings = result.recordset

  const settings: Array<Partial<Setting> & SettingProperties> = [
    ...settingProperties
  ]

  for (const databaseSetting of databaseSettings) {
    const settingKey = databaseSetting.settingKey

    const setting = settings.find(
      (property) => property.settingKey === settingKey
    )

    if (setting !== undefined) {
      Object.assign(setting, databaseSetting)
    }
  }

  return settings
}
