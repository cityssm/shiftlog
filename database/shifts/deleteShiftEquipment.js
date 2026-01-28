import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteShiftEquipment(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('equipmentNumber', form.equipmentNumber)
            .query(/* sql */ `
        DELETE FROM ShiftLog.ShiftEquipment
        WHERE
          shiftId = @shiftId
          AND equipmentNumber = @equipmentNumber
      `);
        return true;
    }
    catch {
        return false;
    }
}
