import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getDataListItemsAdmin(dataListKey) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const dataListItemsResult = (await pool
        .request()
        .input('dataListKey', dataListKey).query(/* sql */ `
      select
        dataListItemId, dataListKey, dataListItem, orderNumber, userGroupId
      from ShiftLog.DataListItems
      where dataListKey = @dataListKey
        and recordDelete_dateTime is null
      order by orderNumber, dataListItem
    `));
    return dataListItemsResult.recordset;
}
