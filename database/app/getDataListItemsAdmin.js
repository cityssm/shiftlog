import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getDataListItemsAdmin(dataListKey) {
    const pool = await getShiftLogConnectionPool();
    const dataListItemsResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('dataListKey', dataListKey)
        .query(/* sql */ `
      SELECT
        dataListItemId,
        dataListKey,
        dataListItem,
        colorHex,
        iconClass,
        orderNumber,
        userGroupId
      FROM
        ShiftLog.DataListItems
      WHERE
        instance = @instance
        AND dataListKey = @dataListKey
        AND recordDelete_dateTime IS NULL
      ORDER BY
        orderNumber,
        dataListItem
    `);
    return dataListItemsResult.recordset;
}
