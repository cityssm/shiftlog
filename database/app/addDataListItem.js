import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database:addDataListItem`);
export default async function addDataListItem(form) {
    const pool = await getShiftLogConnectionPool();
    // Check for existing item
    const existingDataListItemResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('dataListKey', form.dataListKey)
        .input('dataListItem', form.dataListItem).query(/* sql */ `
      select dataListItemId, recordDelete_dateTime
      from ShiftLog.DataListItems
      where instance = @instance
        and dataListKey = @dataListKey
        and dataListItem = @dataListItem
    `);
    if (existingDataListItemResult.recordset.length > 0) {
        // Check if deleted
        const existingDataListItem = existingDataListItemResult.recordset[0];
        if (existingDataListItem.recordDelete_dateTime !== null) {
            // Undelete
            try {
                await pool
                    .request()
                    .input('dataListItemId', existingDataListItem.dataListItemId)
                    .input('userName', form.userName).query(/* sql */ `
            update ShiftLog.DataListItems
            set
              recordDelete_userName = null,
              recordDelete_dateTime = null,
              recordUpdate_userName = @userName,
              recordUpdate_dateTime = getdate()
            where dataListItemId = @dataListItemId
          `);
                return true;
            }
            catch (error) {
                debug('Error undeleting data list item:', error);
                return false;
            }
        }
        // Already exists
        return false;
    }
    try {
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('dataListKey', form.dataListKey)
            .input('dataListItem', form.dataListItem)
            .input('userGroupId', (form.userGroupId ?? '') === '' ? null : form.userGroupId)
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
          and instance = @instance
          and recordDelete_dateTime is null
      `);
        return true;
    }
    catch (error) {
        debug('Error adding data list item:', error);
        return false;
    }
}
