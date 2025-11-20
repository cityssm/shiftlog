import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getOrAddDataListItemId(dataListKey, dataListItem, userName) {
    const pool = await getShiftLogConnectionPool();
    const dataListItems = await pool
        .request()
        .input('dataListKey', dataListKey)
        .input('dataListItem', dataListItem).query(/* sql */ `
      select top 1
        dataListItemId, dataListKey, dataListItem, userGroupId, orderNumber,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime,
        recordDelete_userName, recordDelete_dateTime
      from ShiftLog.DataListItems
      where dataListKey = @dataListKey
        and dataListItem = @dataListItem
    `);
    if (dataListItems.recordset.length > 0) {
        const existingDataListItem = dataListItems.recordset[0];
        if (existingDataListItem.recordDelete_dateTime !== null) {
            await pool
                .request()
                .input('dataListItemId', existingDataListItem.dataListItemId)
                .input('userName', userName).query(/* sql */ `
          update ShiftLog.DataListItems
          set
            recordUpdate_userName = @userName,
            recordUpdate_dateTime = getutcdate(),
            recordDelete_userName = null,
            recordDelete_dateTime = null
          where dataListItemId = @dataListItemId
        `);
        }
        return existingDataListItem.dataListItemId;
    }
    const insertResult = await pool
        .request()
        .input('dataListKey', dataListKey)
        .input('dataListItem', dataListItem)
        .input('userName', userName).query(/* sql */ `
      insert into ShiftLog.DataListItems (
        dataListKey, dataListItem, orderNumber,
        recordCreate_userName, recordUpdate_userName
      )
      select 
        @dataListKey, @dataListItem,
        coalesce(max(orderNumber) + 1, 0),
        @userName, @userName
      from ShiftLog.DataListItems
      where dataListKey = @dataListKey
        and recordDelete_dateTime is null;

      select SCOPE_IDENTITY() as dataListItemId;
    `);
    return insertResult.recordset[0].dataListItemId;
}
