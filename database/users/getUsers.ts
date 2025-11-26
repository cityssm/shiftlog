import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { DatabaseUser } from '../../types/record.types.js'
import type { UserSettingKey } from '../../types/user.types.js'

export default async function getUsers(): Promise<DatabaseUser[]> {
  const pool = await getShiftLogConnectionPool()

  // Get all users
  const usersResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<DatabaseUser>(/* sql */ `
      select u.userName, u.isActive, u.isAdmin,
        u.shifts_canView, u.shifts_canUpdate, u.shifts_canManage,
        u.workOrders_canView, u.workOrders_canUpdate, u.workOrders_canManage,
        u.timesheets_canView, u.timesheets_canUpdate, u.timesheets_canManage,
        u.recordCreate_userName, u.recordCreate_dateTime,
        u.recordUpdate_userName, u.recordUpdate_dateTime
      from ShiftLog.Users u
      where u.instance = @instance
        and u.recordDelete_dateTime is null
      order by u.userName
    `)

  const users = usersResult.recordset

  // Get settings for each user
  for (const user of users) {
    const settingsResult = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('userName', user.userName).query(/* sql */ `
        select settingKey, settingValue
        from ShiftLog.UserSettings
        where instance = @instance
          and userName = @userName
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
