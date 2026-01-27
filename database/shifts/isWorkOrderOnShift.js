import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function isWorkOrderOnShift(shiftId, workOrderId) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('workOrderId', workOrderId)
        .query(/* sql */ `
      SELECT
        count(*) AS recordCount
      FROM
        ShiftLog.ShiftWorkOrders
      WHERE
        shiftId = @shiftId
        AND workOrderId = @workOrderId
    `));
    return result.recordset[0].recordCount > 0;
}
