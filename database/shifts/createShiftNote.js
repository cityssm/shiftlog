import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import getShift from './getShift.js';
export default async function createShiftNote(createShiftNoteForm, userName) {
    const shift = await getShift(createShiftNoteForm.shiftId);
    if (shift === undefined) {
        return undefined;
    }
    const pool = await getShiftLogConnectionPool();
    const sequenceResult = await pool
        .request()
        .input('shiftId', createShiftNoteForm.shiftId)
        .query(`
      SELECT
        isnull(max(noteSequence), 0) + 1 AS nextSequence
      FROM
        ShiftLog.ShiftNotes
      WHERE
        shiftId = @shiftId
    `);
    const nextSequence = sequenceResult.recordset[0].nextSequence;
    const result = await pool
        .request()
        .input('shiftId', createShiftNoteForm.shiftId)
        .input('noteSequence', nextSequence)
        .input('noteTypeId', createShiftNoteForm.noteTypeId ?? null)
        .input('noteText', createShiftNoteForm.noteText)
        .input('userName', userName)
        .query(`
      INSERT INTO
        ShiftLog.ShiftNotes (
          shiftId,
          noteSequence,
          noteTypeId,
          noteText,
          recordCreate_userName,
          recordUpdate_userName
        )
      VALUES
        (
          @shiftId,
          @noteSequence,
          @noteTypeId,
          @noteText,
          @userName,
          @userName
        )
    `);
    if (result.rowsAffected[0] > 0) {
        if (createShiftNoteForm.noteTypeId !== undefined &&
            createShiftNoteForm.fields !== undefined) {
            for (const [noteTypeFieldId, fieldValue] of Object.entries(createShiftNoteForm.fields)) {
                if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                    await pool
                        .request()
                        .input('shiftId', createShiftNoteForm.shiftId)
                        .input('noteSequence', nextSequence)
                        .input('noteTypeFieldId', noteTypeFieldId)
                        .input('fieldValue', fieldValue)
                        .query(`
              INSERT INTO
                ShiftLog.ShiftNoteFields (
                  shiftId,
                  noteSequence,
                  noteTypeFieldId,
                  fieldValue
                )
              VALUES
                (
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
    return nextSequence;
}
