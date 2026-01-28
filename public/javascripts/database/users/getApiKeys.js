import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getApiKeys() {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('settingKey', 'apiKey')
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT
        s.userName,
        s.settingValue
      FROM
        ShiftLog.UserSettings s
      WHERE
        s.settingKey = @settingKey
        AND s.instance = @instance
        AND s.userName IN (
          SELECT
            userName
          FROM
            ShiftLog.Users
          WHERE
            instance = @instance
            AND isActive = 1
            AND recordDelete_dateTime IS NULL
        )
    `);
    const apiKeys = {};
    const rows = result.recordset;
    for (const row of rows) {
        apiKeys[row.userName] = row.settingValue;
    }
    return apiKeys;
}
//# sourceMappingURL=getApiKeys.js.map