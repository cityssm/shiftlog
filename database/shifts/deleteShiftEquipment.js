import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function deleteShiftEquipment(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
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
