import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function reorderDataListItems(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        for (const [index, dataListItemId] of form.dataListItemIds.entries()) {
            await pool
                .request()
                .input('dataListItemId', dataListItemId)
                .input('orderNumber', index)
                .input('userName', form.userName)
                .query(`
          UPDATE ShiftLog.DataListItems
          SET
            orderNumber = @orderNumber,
            recordUpdate_userName = @userName,
            recordUpdate_dateTime = getdate()
          WHERE
            dataListItemId = @dataListItemId
            AND recordDelete_dateTime IS NULL
        `);
        }
        return true;
    }
    catch {
        return false;
    }
}
