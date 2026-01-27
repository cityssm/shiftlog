import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function updateShiftEmployeeNote(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('employeeNumber', form.employeeNumber)
            .input('shiftEmployeeNote', form.shiftEmployeeNote)
            .query(/* sql */ `
        UPDATE ShiftLog.ShiftEmployees
        SET
          shiftEmployeeNote = @shiftEmployeeNote
        WHERE
          shiftId = @shiftId
          AND employeeNumber = @employeeNumber
      `);
        return true;
    }
    catch {
        return false;
    }
}
