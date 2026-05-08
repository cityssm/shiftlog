import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteWorkOrderEquipment(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        const result = await pool
            .request()
            .input('equipmentNumber', form.equipmentNumber)
            .input('instance', getConfigProperty('application.instance'))
            .input('workOrderId', form.workOrderId)
            .query(`
        DELETE woe
        FROM
          ShiftLog.WorkOrderEquipment woe
          INNER JOIN ShiftLog.WorkOrders wo ON woe.workOrderId = wo.workOrderId
        WHERE
          woe.workOrderId = @workOrderId
          AND woe.equipmentNumber = @equipmentNumber
          AND wo.instance = @instance
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
