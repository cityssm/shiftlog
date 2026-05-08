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
        IF EXISTS (
          SELECT
            1
          FROM
            ShiftLog.WorkOrders wo
            INNER JOIN ShiftLog.Equipment eq ON wo.instance = eq.instance
          WHERE
            wo.workOrderId = @workOrderId
            AND wo.instance = @instance
            AND wo.recordDelete_dateTime IS NULL
            AND eq.equipmentNumber = @equipmentNumber
            AND eq.recordDelete_dateTime IS NULL
        )
        BEGIN
          IF EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderEquipment
            WHERE
              workOrderId = @workOrderId
              AND equipmentNumber = @equipmentNumber
          )
          BEGIN
            UPDATE ShiftLog.WorkOrderEquipment
            SET
              workOrderEquipmentNote = @workOrderEquipmentNote,
              recordUpdate_userName = @userName,
              recordUpdate_dateTime = getdate(),
              recordDelete_userName = NULL,
              recordDelete_dateTime = NULL
            WHERE
              workOrderId = @workOrderId
              AND equipmentNumber = @equipmentNumber
          END
          ELSE
          BEGIN
            INSERT INTO
              ShiftLog.WorkOrderEquipment (
                workOrderId,
                instance,
                equipmentNumber,
                workOrderEquipmentNote,
                recordCreate_userName,
                recordUpdate_userName
              )
            VALUES
              (
                @workOrderId,
                @instance,
                @equipmentNumber,
                @workOrderEquipmentNote,
                @userName,
                @userName
              )
          END
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
