import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function toggleNotificationConfigurationIsActive(notificationConfigurationId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('notificationConfigurationId', notificationConfigurationId)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.NotificationConfigurations
      set
        isActive = case when isActive = 1 then 0 else 1 end,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where notificationConfigurationId = @notificationConfigurationId
        and instance = @instance
        and recordDelete_dateTime is null
    `));
    return result.rowsAffected[0] > 0;
}
