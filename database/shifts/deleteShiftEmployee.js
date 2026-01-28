import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteShiftEmployee(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('employeeNumber', form.employeeNumber)
            .query(/* sql */ `
        DELETE FROM ShiftLog.ShiftEmployees
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
