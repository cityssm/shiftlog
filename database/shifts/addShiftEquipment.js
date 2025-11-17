import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function addShiftEquipment(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('equipmentNumber', form.equipmentNumber)
            .input('employeeNumber', form.employeeNumber ?? null)
            .input('shiftEquipmentNote', form.shiftEquipmentNote ?? '').query(/* sql */ `
        insert into ShiftLog.ShiftEquipment (shiftId, equipmentNumber, employeeNumber, shiftEquipmentNote)
        values (@shiftId, @equipmentNumber, @employeeNumber, @shiftEquipmentNote)
      `);
        return true;
    }
    catch {
        return false;
    }
}
