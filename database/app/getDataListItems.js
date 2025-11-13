import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getDataListItems(dataListKey, userName) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const dataListItemsResult = (await pool
        .request()
        .input('dataListKey', dataListKey)
        .input('userName', userName).query(/* sql */ `
      select
      dataListItemId, dataListKey, dataListItem
      from ShiftLog.DataListItems
      where dataListKey = @dataListKey
        and (userGroupId is null or userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        ))
        and recordDelete_dateTime is null
      order by dataListItem
    `));
    return dataListItemsResult.recordset;
}
