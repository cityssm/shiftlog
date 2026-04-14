import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function reorderNoteTypeFields(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        for (const [index, noteTypeFieldId] of form.noteTypeFieldIds.entries()) {
            await pool
                .request()
                .input('noteTypeFieldId', noteTypeFieldId)
                .input('noteTypeId', form.noteTypeId)
                .input('orderNumber', index)
                .input('userName', form.userName)
                .query(`
          UPDATE ShiftLog.NoteTypeFields
          SET
            orderNumber = @orderNumber,
            recordUpdate_userName = @userName,
            recordUpdate_dateTime = getdate()
          WHERE
            noteTypeFieldId = @noteTypeFieldId
            AND noteTypeId = @noteTypeId
            AND recordDelete_dateTime IS NULL
        `);
        }
        return true;
    }
    catch {
        return false;
    }
}
