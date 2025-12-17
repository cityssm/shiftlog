import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function updateShiftEquipment(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('equipmentNumber', form.equipmentNumber)
            .input('employeeNumber', (form.employeeNumber ?? '') === '' ? undefined : form.employeeNumber).query(/* sql */ `
        update ShiftLog.ShiftEquipment
        set employeeNumber = @employeeNumber
        where shiftId = @shiftId
          and equipmentNumber = @equipmentNumber
      `);
        return true;
    }
    catch {
        return false;
    }
}
