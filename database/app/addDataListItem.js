// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addDataListItem(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('dataListKey', form.dataListKey)
            .input('dataListItem', form.dataListItem)
            .input('userGroupId', form.userGroupId ?? null)
            .input('userName', form.userName).query(/* sql */ `
        insert into ShiftLog.DataListItems (
          instance, dataListKey, dataListItem, userGroupId, orderNumber,
          recordCreate_userName, recordUpdate_userName
        )
        select 
          @instance, @dataListKey, @dataListItem, @userGroupId,
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
