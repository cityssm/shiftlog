import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function doGetRequestorSuggestions(searchString, user) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('searchString', searchString)
        .input('userName', user?.userName)
        .query(/* sql */ `
      SELECT DISTINCT
        requestorName,
        requestorContactInfo
      FROM
        ShiftLog.WorkOrders
      WHERE
        instance = @instance
        AND recordDelete_dateTime IS NULL
        AND requestorName LIKE '%' + @searchString + '%'
        AND requestorContactInfo <> ''
      ORDER BY
        requestorName
    `);
    return result.recordset;
}
