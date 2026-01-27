import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { UserSettingKey } from '../../types/user.types.js'

import { updateApiKeyUserSetting } from './updateUserSetting.js'

export default async function getUserSettings(
  userName: string
): Promise<Partial<Record<UserSettingKey, string>>> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .query<{ settingKey: UserSettingKey; settingValue: string }>(/* sql */ `
      SELECT
        settingKey,
        settingValue
      FROM
        ShiftLog.UserSettings
      WHERE
        instance = @instance
        AND userName = @userName
    `)

  const settings: Partial<Record<UserSettingKey, string>> = {}

  for (const row of result.recordset) {
    settings[row.settingKey] = row.settingValue
  }

  // If apiKey is missing or empty, you may want to handle it here (logic omitted for brevity)
  if (settings.apiKey === undefined || settings.apiKey === '') {
    const newApiKey = await updateApiKeyUserSetting(userName)
    settings.apiKey = newApiKey
  }

  return settings
}
