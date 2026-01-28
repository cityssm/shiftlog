import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateShiftEquipment(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('equipmentNumber', form.equipmentNumber)
            .input('employeeNumber', (form.employeeNumber ?? '') === '' ? undefined : form.employeeNumber)
            .query(/* sql */ `
        UPDATE ShiftLog.ShiftEquipment
        SET
          employeeNumber = @employeeNumber
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
