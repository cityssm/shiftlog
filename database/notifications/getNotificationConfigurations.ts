import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { NotificationConfiguration } from '../../types/record.types.js'

export default async function getNotificationConfigurations(
  notificationQueue?: string
): Promise<NotificationConfiguration[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('notificationQueue', notificationQueue)
    .query<NotificationConfiguration>(/* sql */ `
      SELECT
        nc.notificationConfigurationId,
        nc.notificationQueue,
        nc.notificationType,
        nc.notificationTypeFormJson,
        nc.assignedToId,
        at.assignedToName,
        nc.isActive,
        nc.recordCreate_userName,
        nc.recordCreate_dateTime,
        nc.recordUpdate_userName,
        nc.recordUpdate_dateTime
      FROM
        ShiftLog.NotificationConfigurations nc
        LEFT JOIN ShiftLog.AssignedTo at ON nc.assignedToId = at.assignedToId
      WHERE
        nc.instance = @instance
        AND nc.recordDelete_dateTime IS NULL ${notificationQueue === undefined
          ? ''
          : 'AND nc.notificationQueue = @notificationQueue'}
      ORDER BY
        nc.notificationQueue,
        nc.notificationType
    `)

  return result.recordset
}
