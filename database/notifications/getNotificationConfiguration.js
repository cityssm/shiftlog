import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getNotificationConfiguration(notificationConfigurationId) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('notificationConfigurationId', notificationConfigurationId).query(/* sql */ `
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
        and nc.notificationConfigurationId = @notificationConfigurationId
        and nc.recordDelete_dateTime is null
    `));
    return result.recordset[0];
}
