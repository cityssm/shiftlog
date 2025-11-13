import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function addDataListItem(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        await pool
            .request()
            .input('dataListKey', form.dataListKey)
            .input('dataListItem', form.dataListItem)
            .input('userName', form.userName).query(/* sql */ `
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
          and recordDelete_dateTime is null
      `);
        return true;
    }
    catch {
        return false;
    }
}
