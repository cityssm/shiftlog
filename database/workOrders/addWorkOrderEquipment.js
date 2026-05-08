import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addWorkOrderEquipment(form, userName) {
    const pool = await getShiftLogConnectionPool();
    try {
        const result = await pool
            .request()
            .input('equipmentNumber', form.equipmentNumber)
            .input('instance', getConfigProperty('application.instance'))
            .input('userName', userName)
            .input('workOrderEquipmentNote', form.workOrderEquipmentNote ?? '')
            .input('workOrderId', form.workOrderId)
            .query(`
        INSERT INTO
          ShiftLog.WorkOrderEquipment (
            workOrderId,
            instance,
            equipmentNumber,
            workOrderEquipmentNote,
            recordCreate_userName,
            recordUpdate_userName
          )
        SELECT
          @workOrderId,
          @instance,
          @equipmentNumber,
          @workOrderEquipmentNote,
          @userName,
          @userName
        WHERE
          EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrders
            WHERE
              workOrderId = @workOrderId
              AND instance = @instance
              AND recordDelete_dateTime IS NULL
          )
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
