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
    .input('recordUpdate_dateTime', new Date()).query(/* sql */ `
      update ShiftLog.UserSettings
      set settingValue = @settingValue,
        previousSettingValue = settingValue,
        recordUpdate_dateTime = @recordUpdate_dateTime
      where instance = @instance
        and userName = @userName
        and settingKey = @settingKey
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
    .input('recordUpdate_dateTime', new Date()).query(/* sql */ `
      insert into ShiftLog.UserSettings (instance, userName, settingKey, settingValue, recordUpdate_dateTime)
      values (@instance, @userName, @settingKey, @settingValue, @recordUpdate_dateTime)
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
