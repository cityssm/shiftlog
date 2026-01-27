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
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.NotificationConfigurations
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      WHERE
        notificationConfigurationId = @notificationConfigurationId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `)) as mssql.IResult<Record<string, never>>

  return result.rowsAffected[0] > 0
}
