import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getDataLists() {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const dataListsResult = (await pool.request().query(/* sql */ `
    select dataListKey, dataListName, isSystemList
    from ShiftLog.DataLists
    where recordDelete_dateTime is null
    order by dataListName
  `));
    return dataListsResult.recordset;
}
