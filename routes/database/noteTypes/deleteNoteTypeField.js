import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteNoteTypeField(noteTypeFieldId, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        await pool
            .request()
            .input('noteTypeFieldId', noteTypeFieldId)
            .input('recordDelete_userName', user.userName)
            .input('recordDelete_dateTime', currentDate)
            .query(/* sql */ `
        UPDATE
          ShiftLog.NoteTypeFields
        SET
          recordDelete_userName = @recordDelete_userName,
          recordDelete_dateTime = @recordDelete_dateTime
        WHERE
          noteTypeFieldId = @noteTypeFieldId
          AND recordDelete_dateTime IS NULL
      `);
        return true;
    }
    catch {
        return false;
    }
}
