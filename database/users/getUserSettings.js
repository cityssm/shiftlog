import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { updateApiKeyUserSetting } from './updateUserSetting.js';
export default async function getUserSettings(userName) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .query(/* sql */ `
      SELECT
        settingKey,
        settingValue
      FROM
        ShiftLog.UserSettings
      WHERE
        instance = @instance
        AND userName = @userName
    `));
    const settings = {};
    for (const row of result.recordset) {
        settings[row.settingKey] = row.settingValue;
    }
    // If apiKey is missing or empty, you may want to handle it here (logic omitted for brevity)
    if (settings.apiKey === undefined || settings.apiKey === '') {
        const newApiKey = await updateApiKeyUserSetting(userName);
        settings.apiKey = newApiKey;
    }
    return settings;
}
