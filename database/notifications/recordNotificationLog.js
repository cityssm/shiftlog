import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function recordNotificationLog(form) {
    const pool = await getShiftLogConnectionPool();
    await pool
        .request()
        .input('notificationConfigurationId', form.notificationConfigurationId)
        .input('recordId', form.recordId)
        .input('notificationDateTime', form.notificationDate ?? new Date())
        .input('isSuccess', form.isSuccess)
        .input('errorMessage', form.errorMessage).query(/* sql */ `
      insert into ShiftLog.NotificationLogs
        (notificationConfigurationId, recordId, notificationDateTime, isSuccess, errorMessage)
      values
        (@notificationConfigurationId, @recordId, @notificationDateTime, @isSuccess, @errorMessage)
    `);
}
