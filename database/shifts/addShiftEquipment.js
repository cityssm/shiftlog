import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addShiftEquipment(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('instance', getConfigProperty('application.instance'))
            .input('equipmentNumber', form.equipmentNumber)
            .input('employeeNumber', (form.employeeNumber ?? '') === '' ? undefined : form.employeeNumber)
            .input('shiftEquipmentNote', form.shiftEquipmentNote ?? '')
            .query(/* sql */ `
        insert into ShiftLog.ShiftEquipment (shiftId, instance, equipmentNumber, employeeNumber, shiftEquipmentNote)
        values (@shiftId, @instance, @equipmentNumber, @employeeNumber, @shiftEquipmentNote)
      `);
        return true;
    }
    catch {
        return false;
    }
}
