import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateShiftCrewNote(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('crewId', form.crewId)
            .input('shiftCrewNote', form.shiftCrewNote)
            .query(/* sql */ `
        UPDATE ShiftLog.ShiftCrews
        SET
          shiftCrewNote = @shiftCrewNote
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
