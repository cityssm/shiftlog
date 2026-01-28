import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteShiftCrew(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('crewId', form.crewId)
            .query(/* sql */ `
        DELETE FROM ShiftLog.ShiftCrews
        WHERE
          shiftId = @shiftId
          AND crewId = @crewId
      `);
        return true;
    }
    catch {
        return false;
    }
}
