import mssqlPool from '@cityssm/mssql-multi-pool';
import { generateApiKey } from '../../helpers/api.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import updateUserSetting from './updateUserSetting.js';
export default async function getUser(userName) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    // Get user record
    const userResult = (await pool.request().input('userName', userName)
        .query(/* sql */ `
      select top 1
        u.userName, u.isActive, u.isAdmin,
        e.employeeNumber, e.firstName, e.lastName,
        u.shifts_canView, u.shifts_canUpdate, u.shifts_canManage,
        u.workOrders_canView, u.workOrders_canUpdate, u.workOrders_canManage,
        u.timesheets_canView, u.timesheets_canUpdate, u.timesheets_canManage,
        u.recordCreate_userName, u.recordCreate_dateTime,
        u.recordUpdate_userName, u.recordUpdate_dateTime
      from ShiftLog.Users u
      left join ShiftLog.Employees e
        on u.userName = e.userName and e.recordDelete_dateTime is null
      where u.userName = @userName
        and u.recordDelete_dateTime is null
    `));
    if (userResult.recordset.length === 0) {
        return undefined;
    }
    const user = userResult.recordset[0];
    // Get user settings
    const settingsResult = await pool.request().input('userName', userName)
        .query(/* sql */ `
      select settingKey, settingValue
      from ShiftLog.UserSettings
      where userName = @userName
    `);
    const settings = {};
    for (const row of settingsResult.recordset) {
        settings[row.settingKey] = row.settingValue;
    }
    if (settings.apiKey === undefined) {
        const apiKey = generateApiKey(user.userName);
        await updateUserSetting(user.userName, 'apiKey', apiKey);
        settings.apiKey = apiKey;
    }
    user.userSettings = settings;
    return user;
}
