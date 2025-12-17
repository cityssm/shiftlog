import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addShiftWorkOrder(shiftId, workOrderId, shiftWorkOrderNote) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('workOrderId', workOrderId)
        .input('shiftWorkOrderNote', shiftWorkOrderNote).query(/* sql */ `
      insert into ShiftLog.ShiftWorkOrders (shiftId, workOrderId, shiftWorkOrderNote)
      values (@shiftId, @workOrderId, @shiftWorkOrderNote)
    `));
    return result.rowsAffected[0] > 0;
}
