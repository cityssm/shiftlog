import { generateApiKey } from '../../helpers/api.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import updateUserSetting from './updateUserSetting.js';
export async function _getUser(userField, userNameOrApiKey) {
    const pool = await getShiftLogConnectionPool();
    const sql = /* sql */ `
    select top 1
      u.userName, u.isActive, u.isAdmin,
      e.employeeNumber, e.firstName, e.lastName,
      u.shifts_canView, u.shifts_canUpdate, u.shifts_canManage,
      u.workOrders_canView, u.workOrders_canUpdate, u.workOrders_canManage,
      u.timesheets_canView, u.timesheets_canUpdate, u.timesheets_canManage,
      u.recordCreate_userName, u.recordCreate_dateTime,
      u.recordUpdate_userName, u.recordUpdate_dateTime
    from ShiftLog.Users u
    left join ShiftLog.UserSettings us
      on u.instance = us.instance
      and u.userName = us.userName
      and us.settingKey = 'apiKey'
    left join ShiftLog.Employees e
      on u.instance = e.instance
      and u.userName = e.userName
      and e.recordDelete_dateTime is null
    where u.instance = @instance
      ${userField === 'apiKey' ? 'and us.settingValue = @userNameOrApiKey' : 'and u.userName = @userNameOrApiKey'}
      and u.recordDelete_dateTime is null
  `;
    // Get user record
    const userResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userNameOrApiKey', userNameOrApiKey)
        .query(sql);
    if (userResult.recordset.length === 0) {
        return undefined;
    }
    const user = userResult.recordset[0];
    // Get user settings
    const settingsResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', user.userName).query(/* sql */ `
      select settingKey, settingValue
      from ShiftLog.UserSettings
      where instance = @instance
        and userName = @userName
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
export default async function getUser(userName) {
    return await _getUser('userName', userName);
}
export async function getUserByApiKey(apiKey) {
    return await _getUser('apiKey', apiKey);
}
