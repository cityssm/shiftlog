import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface NotificationLogForm {
  notificationConfigurationId: number | string
  recordId: number | string
  notificationDate?: Date
  isSuccess: boolean
  errorMessage: string
}

export default async function recordNotificationLog(
  form: NotificationLogForm
): Promise<void> {
  const pool = await getShiftLogConnectionPool()

  await pool
    .request()
    .input('notificationConfigurationId', form.notificationConfigurationId)
    .input('recordId', form.recordId)
    .input('notificationDateTime', form.notificationDate ?? new Date())
    .input('isSuccess', form.isSuccess)
    .input('errorMessage', form.errorMessage)
    .query(/* sql */ `
      INSERT INTO
        ShiftLog.NotificationLogs (
          notificationConfigurationId,
          recordId,
          notificationDateTime,
          isSuccess,
          errorMessage
        )
      VALUES
        (
          @notificationConfigurationId,
          @recordId,
          @notificationDateTime,
          @isSuccess,
          @errorMessage
        )
    `)
}
