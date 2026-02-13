import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteDataListItem(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        const result = await pool
            .request()
            .input('dataListItemId', form.dataListItemId)
            .input('userName', form.userName)
            .query(/* sql */ `
        UPDATE ShiftLog.DataListItems
        SET
          recordDelete_userName = @userName,
          recordDelete_dateTime = getdate()
        WHERE
          dataListItemId = @dataListItemId
          AND recordDelete_dateTime IS NULL
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
