import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function reorderDataListItems(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        for (const [index, dataListItemId] of form.dataListItemIds.entries()) {
            // eslint-disable-next-line no-await-in-loop
            await pool
                .request()
                .input('dataListItemId', dataListItemId)
                .input('orderNumber', index)
                .input('userName', form.userName)
                .query(/* sql */ `
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
