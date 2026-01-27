import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function toggleNotificationConfigurationIsActive(
  notificationConfigurationId: number,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('notificationConfigurationId', notificationConfigurationId)
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.NotificationConfigurations
      SET
        isActive = CASE
          WHEN isActive = 1 THEN 0
          ELSE 1
        END,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        notificationConfigurationId = @notificationConfigurationId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
