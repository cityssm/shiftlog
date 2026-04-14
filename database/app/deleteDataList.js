import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteDataList(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        const result = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('dataListKey', form.dataListKey)
            .input('userName', form.userName)
            .query(`
        UPDATE ShiftLog.DataLists
        SET
          recordDelete_userName = @userName,
          recordDelete_dateTime = getdate()
        WHERE
          instance = @instance
          AND dataListKey = @dataListKey
          AND recordDelete_dateTime IS NULL
          AND isSystemList = 0
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
