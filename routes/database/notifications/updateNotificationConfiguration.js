import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateNotificationConfiguration(form, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('notificationConfigurationId', form.notificationConfigurationId)
        .input('notificationQueue', form.notificationQueue)
        .input('notificationType', form.notificationType)
        .input('notificationTypeFormJson', form.notificationTypeFormJson)
        .input('assignedToId', form.assignedToId && form.assignedToId !== '' ? form.assignedToId : null)
        .input('isActive', form.isActive === true || form.isActive === '1' ? 1 : 0)
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.NotificationConfigurations
      SET
        notificationQueue = @notificationQueue,
        notificationType = @notificationType,
        notificationTypeFormJson = @notificationTypeFormJson,
        assignedToId = @assignedToId,
        isActive = @isActive,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        notificationConfigurationId = @notificationConfigurationId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `);
    return result.rowsAffected[0] > 0;
}
