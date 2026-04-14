import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getUsers() {
    const pool = await getShiftLogConnectionPool();
    const usersResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(`
      SELECT
        u.userName,
        u.isActive,
        u.isAdmin,
        u.shifts_canView,
        u.shifts_canUpdate,
        u.shifts_canManage,
        u.workOrders_canView,
        u.workOrders_canUpdate,
        u.workOrders_canManage,
        u.timesheets_canView,
        u.timesheets_canUpdate,
        u.timesheets_canManage,
        u.recordCreate_userName,
        u.recordCreate_dateTime,
        u.recordUpdate_userName,
        u.recordUpdate_dateTime
      FROM
        ShiftLog.Users u
      WHERE
        u.instance = @instance
        AND u.recordDelete_dateTime IS NULL
      ORDER BY
        u.userName
    `);
    const users = usersResult.recordset;
    for (const user of users) {
        const settingsResult = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('userName', user.userName)
            .query(`
        SELECT
          settingKey,
          settingValue
        FROM
          ShiftLog.UserSettings
        WHERE
          instance = @instance
          AND userName = @userName
      `);
        const settings = {};
        for (const row of settingsResult.recordset) {
            settings[row.settingKey] = row.settingValue;
        }
        user.userSettings = settings;
    }
    return users;
}
export async function getUserCount() {
    const users = await getUsers();
    return users.length;
}
