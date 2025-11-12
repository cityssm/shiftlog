import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { generateApiKey } from '../../helpers/api.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { DatabaseUser } from '../../types/record.types.js'
import type { UserSettingKey } from '../../types/user.types.js'

import updateUserSetting from './updateUserSetting.js'

export default async function getUser(
  userName: string
): Promise<DatabaseUser | undefined> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  // Get user record
  const userResult = (await pool.request().input('userName', userName)
    .query(/* sql */ `
      select userName, isActive, isAdmin,
        shifts_canView, shifts_canUpdate, shifts_canManage,
        workOrders_canView, workOrders_canUpdate, workOrders_canManage,
        timesheets_canView, timesheets_canUpdate, timesheets_canManage,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      from ShiftLog.Users
      where userName = @userName
        and recordDelete_dateTime is null
    `)) as mssql.IResult<DatabaseUser>

  if (userResult.recordset.length === 0) {
    return undefined
  }

  const user = userResult.recordset[0]

  // Get user settings
  const settingsResult = await pool.request().input('userName', userName)
    .query(/* sql */ `
      select settingKey, settingValue
      from ShiftLog.UserSettings
      where userName = @userName
    `)

  const settings: Partial<Record<UserSettingKey, string>> = {}
  for (const row of settingsResult.recordset as Array<{
    settingKey: UserSettingKey
    settingValue: string
  }>) {
    settings[row.settingKey] = row.settingValue
  }

  if (settings.apiKey === undefined) {
    const apiKey = generateApiKey(user.userName)
    await updateUserSetting(user.userName, 'apiKey', apiKey)
    settings.apiKey = apiKey
  }

  user.userSettings = settings

  return user
}
