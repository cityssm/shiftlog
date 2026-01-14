import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateNotificationConfigurationForm {
  notificationConfigurationId: number | string
  notificationQueue: string
  notificationType: string
  notificationTypeFormJson: string
  assignedToId?: number | string
  isActive: boolean | string
}

export default async function updateNotificationConfiguration(
  form: UpdateNotificationConfigurationForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('notificationConfigurationId', form.notificationConfigurationId)
    .input('notificationQueue', form.notificationQueue)
    .input('notificationType', form.notificationType)
    .input('notificationTypeFormJson', form.notificationTypeFormJson)
    .input(
      'assignedToId',
      form.assignedToId && form.assignedToId !== '' ? form.assignedToId : null
    )
    .input('isActive', form.isActive === true || form.isActive === '1' ? 1 : 0)
    .input('userName', userName).query(/* sql */ `
      update ShiftLog.NotificationConfigurations
      set
        notificationQueue = @notificationQueue,
        notificationType = @notificationType,
        notificationTypeFormJson = @notificationTypeFormJson,
        assignedToId = @assignedToId,
        isActive = @isActive,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where notificationConfigurationId = @notificationConfigurationId
        and instance = @instance
        and recordDelete_dateTime is null
    `)) as mssql.IResult<Record<string, never>>

  return result.rowsAffected[0] > 0
}
