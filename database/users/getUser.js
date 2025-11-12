import mssqlPool from '@cityssm/mssql-multi-pool';
import { generateApiKey } from '../../helpers/api.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import updateUserSetting from './updateUserSetting.js';
export default async function getUser(userName) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    // Get user record
    const userResult = (await pool.request().input('userName', userName)
        .query(/* sql */ `
      select userName, isActive, isAdmin,
        shifts_canView, shifts_canUpdate, shifts_canManage,
        workOrders_canView, workOrders_canUpdate, workOrders_canManage,
        timesheets_canView, timesheets_canUpdate, timesheets_canManage,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      from ShiftLog.Users
      where userName = @userName
        and recordDelete_dateTime is null
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
