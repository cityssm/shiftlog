import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { NotificationConfiguration } from '../../types/record.types.js'

export default async function getNotificationConfigurations(): Promise<
  NotificationConfiguration[]
> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance')).query(
      /* sql */ `
      select
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
      from ShiftLog.NotificationConfigurations nc
      left join ShiftLog.AssignedTo at on nc.assignedToId = at.assignedToId
      where nc.instance = @instance
        and nc.recordDelete_dateTime is null
      order by nc.notificationQueue, nc.notificationType
    `
    )) as mssql.IResult<NotificationConfiguration>

  return result.recordset
}
