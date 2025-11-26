import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getApiKeys() {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('settingKey', 'apiKey')
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      select s.userName, s.settingValue
      from ShiftLog.UserSettings s
      where s.settingKey = @settingKey
        and s.instance = @instance
        and s.userName in (
          select userName from ShiftLog.Users
          where instance = @instance
            and isActive = 1
            and recordDelete_dateTime is null
        )
    `));
    const apiKeys = {};
    const rows = result.recordset;
    for (const row of rows) {
        apiKeys[row.userName] = row.settingValue;
    }
    return apiKeys;
}
