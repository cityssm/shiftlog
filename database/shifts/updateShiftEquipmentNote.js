import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function updateShiftEquipmentNote(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('equipmentNumber', form.equipmentNumber)
            .input('shiftEquipmentNote', form.shiftEquipmentNote).query(/* sql */ `
        update ShiftLog.ShiftEquipment
        set shiftEquipmentNote = @shiftEquipmentNote
        where shiftId = @shiftId and equipmentNumber = @equipmentNumber
      `);
        return true;
    }
    catch {
        return false;
    }
}
