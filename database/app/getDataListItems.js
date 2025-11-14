import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getDataListItems(dataListKey, user) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const dataListItemsResult = (await pool
        .request()
        .input('dataListKey', dataListKey)
        .input('userName', user?.userName).query(/* sql */ `
      select
        i.dataListItemId, i.dataListKey, i.dataListItem
      from ShiftLog.DataListItems i
      where i.dataListKey = @dataListKey
        and i.recordDelete_dateTime is null
        ${user === undefined
        ? ''
        : `
                and (i.userGroupId is null or i.userGroupId in (
                  select userGroupId
                  from ShiftLog.UserGroupMembers
                  where userName = @userName
                ))
              `}
      order by i.dataListItem
    `));
    return dataListItemsResult.recordset;
}
