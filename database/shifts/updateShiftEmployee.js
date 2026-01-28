import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateShiftEmployee(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('employeeNumber', form.employeeNumber)
            .input('crewId', form.crewId ?? undefined)
            .query(/* sql */ `
        UPDATE ShiftLog.ShiftEmployees
        SET
          crewId = @crewId
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
