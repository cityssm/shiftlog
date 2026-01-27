import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateNotificationConfigurationForm {
  notificationQueue: string
  notificationType: string
  notificationTypeFormJson: string
  assignedToId?: number | string
  isActive: boolean | string
}

export default async function createNotificationConfiguration(
  form: CreateNotificationConfigurationForm,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('notificationQueue', form.notificationQueue)
    .input('notificationType', form.notificationType)
    .input('notificationTypeFormJson', form.notificationTypeFormJson)
    .input(
      'assignedToId',
      form.assignedToId && form.assignedToId !== '' ? form.assignedToId : null
    )
    .input('isActive', form.isActive === true || form.isActive === '1' ? 1 : 0)
    .input('userName', userName)
    .query(/* sql */ `
      INSERT INTO
        ShiftLog.NotificationConfigurations (
          instance,
          notificationQueue,
          notificationType,
          notificationTypeFormJson,
          assignedToId,
          isActive,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.notificationConfigurationId
      VALUES
        (
          @instance,
          @notificationQueue,
          @notificationType,
          @notificationTypeFormJson,
          @assignedToId,
          @isActive,
          @userName,
          @userName
        )
    `)) as mssql.IResult<{ notificationConfigurationId: number }>

  return result.recordset[0].notificationConfigurationId
}
