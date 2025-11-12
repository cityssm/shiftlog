import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { DatabaseUser } from '../../types/record.types.js'
import type { UserSettingKey } from '../../types/user.types.js'

export default async function getUsers(): Promise<DatabaseUser[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  // Get all users
  const usersResult = (await pool.request().query(/* sql */ `
      select userName, isActive, isAdmin,
        shifts_canView, shifts_canUpdate, shifts_canManage,
        workOrders_canView, workOrders_canUpdate, workOrders_canManage,
        timesheets_canView, timesheets_canUpdate, timesheets_canManage,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      from ShiftLog.Users
      where recordDelete_dateTime is null
      order by userName
    `)) as mssql.IResult<DatabaseUser>

  const users = usersResult.recordset

  // Get settings for each user
  for (const user of users) {
    const settingsResult = await pool.request().input('userName', user.userName)
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
    user.userSettings = settings
  }

  return users
}
