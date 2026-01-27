import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function createWorkOrderNote(createWorkOrderNoteForm, userName) {
    const pool = await getShiftLogConnectionPool();
    // Get the next sequence number
    const sequenceResult = await pool
        .request()
        .input('workOrderId', createWorkOrderNoteForm.workOrderId)
        .query(/* sql */ `
      SELECT
        isnull(max(noteSequence), 0) + 1 AS nextSequence
      FROM
        ShiftLog.WorkOrderNotes
      WHERE
        workOrderId = @workOrderId
    `);
    const nextSequence = sequenceResult.recordset[0].nextSequence;
    await pool
        .request()
        .input('workOrderId', createWorkOrderNoteForm.workOrderId)
        .input('noteSequence', nextSequence)
        .input('noteText', createWorkOrderNoteForm.noteText)
        .input('userName', userName)
        .query(/* sql */ `
      INSERT INTO
        ShiftLog.WorkOrderNotes (
          workOrderId,
          noteSequence,
          noteText,
          recordCreate_userName,
          recordUpdate_userName
        )
      VALUES
        (
          @workOrderId,
          @noteSequence,
          @noteText,
          @userName,
          @userName
        )
    `);
    return nextSequence;
}
