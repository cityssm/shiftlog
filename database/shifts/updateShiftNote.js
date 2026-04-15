import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateShiftNote(updateShiftNoteForm, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('shiftId', updateShiftNoteForm.shiftId)
        .input('noteSequence', updateShiftNoteForm.noteSequence)
        .input('noteText', updateShiftNoteForm.noteText)
        .input('userName', userName)
        .query(`
      UPDATE ShiftLog.ShiftNotes
      SET
        noteText = @noteText,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        shiftId = @shiftId
        AND noteSequence = @noteSequence
        AND recordDelete_dateTime IS NULL
        AND shiftId IN (
          SELECT
            shiftId
          FROM
            ShiftLog.Shifts
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
    `);
    if (result.rowsAffected[0] > 0) {
        if (updateShiftNoteForm.fields !== undefined) {
            for (const [noteTypeFieldId, fieldValue] of Object.entries(updateShiftNoteForm.fields)) {
                if (fieldValue !== undefined && fieldValue !== null) {
                    const existingField = await pool
                        .request()
                        .input('shiftId', updateShiftNoteForm.shiftId)
                        .input('noteSequence', updateShiftNoteForm.noteSequence)
                        .input('noteTypeFieldId', noteTypeFieldId)
                        .query(`
              SELECT COUNT(*) as count
              FROM ShiftLog.ShiftNoteFields
              WHERE shiftId = @shiftId
                AND noteSequence = @noteSequence
                AND noteTypeFieldId = @noteTypeFieldId
            `);
                    if (existingField.recordset[0].count > 0) {
                        await pool
                            .request()
                            .input('shiftId', updateShiftNoteForm.shiftId)
                            .input('noteSequence', updateShiftNoteForm.noteSequence)
                            .input('noteTypeFieldId', noteTypeFieldId)
                            .input('fieldValue', fieldValue)
                            .query(`
                UPDATE ShiftLog.ShiftNoteFields
                SET fieldValue = @fieldValue
                WHERE shiftId = @shiftId
                  AND noteSequence = @noteSequence
                  AND noteTypeFieldId = @noteTypeFieldId
              `);
                    }
                    else {
                        await pool
                            .request()
                            .input('shiftId', updateShiftNoteForm.shiftId)
                            .input('noteSequence', updateShiftNoteForm.noteSequence)
                            .input('noteTypeFieldId', noteTypeFieldId)
                            .input('fieldValue', fieldValue)
                            .query(`
                INSERT INTO ShiftLog.ShiftNoteFields (
                  shiftId,
                  noteSequence,
                  noteTypeFieldId,
                  fieldValue
                )
                VALUES (
                  @shiftId,
                  @noteSequence,
                  @noteTypeFieldId,
                  @fieldValue
                )
              `);
                    }
                }
            }
        }
    }
    return result.rowsAffected[0] > 0;
}
