import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateShiftEquipmentNote(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('equipmentNumber', form.equipmentNumber)
            .input('shiftEquipmentNote', form.shiftEquipmentNote)
            .query(/* sql */ `
        UPDATE ShiftLog.ShiftEquipment
        SET
          shiftEquipmentNote = @shiftEquipmentNote
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
