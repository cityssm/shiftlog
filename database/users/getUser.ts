import { generateApiKey } from '../../helpers/api.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { DatabaseUser } from '../../types/record.types.js'
import type { UserSettingKey } from '../../types/user.types.js'

import updateUserSetting from './updateUserSetting.js'

export async function _getUser(
  userField: 'apiKey' | 'userName',
  userNameOrApiKey: string
): Promise<DatabaseUser | undefined> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    SELECT
      TOP 1 u.userName,
      u.isActive,
      u.isAdmin,
      e.employeeNumber,
      e.firstName,
      e.lastName,
      u.shifts_canView,
      u.shifts_canUpdate,
      u.shifts_canManage,
      u.workOrders_canView,
      u.workOrders_canUpdate,
      u.workOrders_canManage,
      u.timesheets_canView,
      u.timesheets_canUpdate,
      u.timesheets_canManage,
      u.recordCreate_userName,
      u.recordCreate_dateTime,
      u.recordUpdate_userName,
      u.recordUpdate_dateTime
    FROM
      ShiftLog.Users u
      LEFT JOIN ShiftLog.UserSettings us ON u.instance = us.instance
      AND u.userName = us.userName
      AND us.settingKey = 'apiKey'
      LEFT JOIN ShiftLog.Employees e ON u.instance = e.instance
      AND u.userName = e.userName
      AND e.recordDelete_dateTime IS NULL
    WHERE
      u.instance = @instance ${userField === 'apiKey'
        ? 'AND us.settingValue = @userNameOrApiKey'
        : 'AND u.userName = @userNameOrApiKey'}
      AND u.recordDelete_dateTime IS NULL
  `

  // Get user record
  const userResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userNameOrApiKey', userNameOrApiKey)
    .query<DatabaseUser>(sql)

  if (userResult.recordset.length === 0) {
    return undefined
  }

  const user = userResult.recordset[0]

  // Get user settings
  const settingsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user.userName)
    .query(/* sql */ `
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

export default async function getUser(
  userName: string
): Promise<DatabaseUser | undefined> {
  return await _getUser('userName', userName)
}

export async function getUserByApiKey(
  apiKey: string
): Promise<DatabaseUser | undefined> {
  return await _getUser('apiKey', apiKey)
}
