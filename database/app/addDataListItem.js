import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database:addDataListItem`);
export default async function addDataListItem(form) {
    const pool = await getShiftLogConnectionPool();
    const colorHexTrimmed = (form.colorHex ?? '').trim();
    const colorHex = /^[\da-f]{6}$/iv.test(colorHexTrimmed)
        ? colorHexTrimmed
        : '000000';
    const iconClassTrimmed = (form.iconClass ?? '').trim();
    const iconClass = /^[\da-z\-]+$/v.test(iconClassTrimmed)
        ? iconClassTrimmed
        : 'circle';
    const existingDataListItemResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('dataListKey', form.dataListKey)
        .input('dataListItem', form.dataListItem)
        .query(`
      SELECT
        dataListItemId,
        recordDelete_dateTime
      FROM
        ShiftLog.DataListItems
      WHERE
        instance = @instance
        AND dataListKey = @dataListKey
        AND dataListItem = @dataListItem
    `);
    if (existingDataListItemResult.recordset.length > 0) {
        const existingDataListItem = existingDataListItemResult.recordset[0];
        if (existingDataListItem.recordDelete_dateTime !== null) {
            try {
                await pool
                    .request()
                    .input('dataListItemId', existingDataListItem.dataListItemId)
                    .input('userName', form.userName)
                    .query(`
            UPDATE ShiftLog.DataListItems
            SET
              recordDelete_userName = NULL,
              recordDelete_dateTime = NULL,
              recordUpdate_userName = @userName,
              recordUpdate_dateTime = getdate()
            WHERE
              dataListItemId = @dataListItemId
          `);
                return true;
            }
            catch (error) {
                debug('Error undeleting data list item:', error);
                return false;
            }
        }
        return false;
    }
    try {
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('dataListKey', form.dataListKey)
            .input('dataListItem', form.dataListItem)
            .input('colorHex', colorHex)
            .input('iconClass', iconClass)
            .input('userGroupId', (form.userGroupId ?? '') === '' ? null : form.userGroupId)
            .input('userName', form.userName)
            .query(`
        INSERT INTO
          ShiftLog.DataListItems (
            instance,
            dataListKey,
            dataListItem,
            colorHex,
            iconClass,
            userGroupId,
            orderNumber,
            recordCreate_userName,
            recordUpdate_userName
          )
        SELECT
          @instance,
          @dataListKey,
          @dataListItem,
          @colorHex,
          @iconClass,
          @userGroupId,
          coalesce(max(orderNumber) + 1, 0),
          @userName,
          @userName
        FROM
          ShiftLog.DataListItems
        WHERE
          dataListKey = @dataListKey
          AND instance = @instance
          AND recordDelete_dateTime IS NULL
      `);
        return true;
    }
    catch (error) {
        debug('Error adding data list item:', error);
        return false;
    }
}
