import { generateApiKey } from '../../helpers/api.helpers.js'
import { clearCacheByTableName } from '../../helpers/cache.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { UserSettingKey } from '../../types/user.types.js'

export interface UpdateSettingForm {
  settingKey: string
  settingValue: string
}

export default async function updateUserSetting(
  userName: string,
  settingKey: UserSettingKey,
  settingValue: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  // Try to update first
  const updateResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .input('settingKey', settingKey)
    .input('settingValue', settingValue)
    .input('recordUpdate_dateTime', new Date())
    .query(/* sql */ `
      UPDATE ShiftLog.UserSettings
      SET
        settingValue = @settingValue,
        previousSettingValue = settingValue,
        recordUpdate_dateTime = @recordUpdate_dateTime
      WHERE
        instance = @instance
        AND userName = @userName
        AND settingKey = @settingKey
    `)

  if (updateResult.rowsAffected[0] > 0) {
    return true
  }

  // If no rows updated, insert new
  const insertResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .input('settingKey', settingKey)
    .input('settingValue', settingValue)
    .input('recordUpdate_dateTime', new Date())
    .query(/* sql */ `
      INSERT INTO
        ShiftLog.UserSettings (
          instance,
          userName,
          settingKey,
          settingValue,
          recordUpdate_dateTime
        )
      VALUES
        (
          @instance,
          @userName,
          @settingKey,
          @settingValue,
          @recordUpdate_dateTime
        )
    `)

  return insertResult.rowsAffected[0] > 0
}

export async function updateApiKeyUserSetting(
  userName: string
): Promise<string> {
  if (userName === '') {
    throw new Error('Cannot update API key for empty user name')
  }

  const apiKey = generateApiKey(userName)
  await updateUserSetting(userName, 'apiKey', apiKey)
  clearCacheByTableName('UserSettings')
  return apiKey
}
