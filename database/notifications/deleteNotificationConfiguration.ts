import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteNotificationConfiguration(
  notificationConfigurationId: number,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('notificationConfigurationId', notificationConfigurationId)
    .input('userName', userName).query(/* sql */ `
      update ShiftLog.NotificationConfigurations
      set
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      where notificationConfigurationId = @notificationConfigurationId
        and instance = @instance
        and recordDelete_dateTime is null
    `)) as mssql.IResult<Record<string, never>>

  return result.rowsAffected[0] > 0
}
