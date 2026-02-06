import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getDataLists() {
    const pool = await getShiftLogConnectionPool();
    const dataListsResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT
        dataListKey,
        dataListName,
        isSystemList
      FROM
        ShiftLog.DataLists
      WHERE
        recordDelete_dateTime IS NULL
        AND instance = @instance
      ORDER BY
        dataListName
    `);
    return dataListsResult.recordset;
}
