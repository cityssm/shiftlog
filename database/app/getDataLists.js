import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getDataLists() {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const dataListsResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
    select dataListKey, dataListName, isSystemList
    from ShiftLog.DataLists
    where recordDelete_dateTime is null
      and instance = @instance
    order by dataListName
  `);
    return dataListsResult.recordset;
}
