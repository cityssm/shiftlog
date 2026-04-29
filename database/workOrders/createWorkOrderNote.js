import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js';
import getWorkOrder from './getWorkOrder.js';
export default async function createWorkOrderNote(createWorkOrderNoteForm, userName) {
    const workOrder = await getWorkOrder(createWorkOrderNoteForm.workOrderId);
    if (workOrder === undefined) {
        return undefined;
    }
    const pool = await getShiftLogConnectionPool();
    const sequenceResult = await pool
        .request()
        .input('workOrderId', createWorkOrderNoteForm.workOrderId)
        .query(`
      SELECT
        isnull(max(noteSequence), 0) + 1 AS nextSequence
      FROM
        ShiftLog.WorkOrderNotes
      WHERE
        workOrderId = @workOrderId
    `);
    const nextSequence = sequenceResult.recordset[0].nextSequence;
    const result = await pool
        .request()
        .input('workOrderId', createWorkOrderNoteForm.workOrderId)
        .input('noteSequence', nextSequence)
        .input('noteTypeId', createWorkOrderNoteForm.noteTypeId ?? null)
        .input('noteText', createWorkOrderNoteForm.noteText)
        .input('userName', userName.slice(0, 30))
        .query(`
      INSERT INTO
        ShiftLog.WorkOrderNotes (
          workOrderId,
          noteSequence,
          noteTypeId,
          noteText,
          recordCreate_userName,
          recordUpdate_userName
        )
      VALUES
        (
          @workOrderId,
          @noteSequence,
          @noteTypeId,
          @noteText,
          @userName,
          @userName
        )
    `);
    if (result.rowsAffected[0] > 0) {
        if (createWorkOrderNoteForm.noteTypeId !== undefined &&
            createWorkOrderNoteForm.fields !== undefined) {
            for (const [noteTypeFieldId, fieldValue] of Object.entries(createWorkOrderNoteForm.fields)) {
                if ((fieldValue ?? '') !== '') {
                    await pool
                        .request()
                        .input('workOrderId', createWorkOrderNoteForm.workOrderId)
                        .input('noteSequence', nextSequence)
                        .input('noteTypeFieldId', noteTypeFieldId)
                        .input('fieldValue', fieldValue)
                        .query(`
              INSERT INTO
                ShiftLog.WorkOrderNoteFields (
                  workOrderId,
                  noteSequence,
                  noteTypeFieldId,
                  fieldValue
                )
              VALUES
                (
                  @workOrderId,
                  @noteSequence,
                  @noteTypeFieldId,
                  @fieldValue
                )
            `);
                }
            }
        }
        sendNotificationWorkerMessage('workOrder.update', typeof createWorkOrderNoteForm.workOrderId === 'string'
            ? Number.parseInt(createWorkOrderNoteForm.workOrderId, 10)
            : createWorkOrderNoteForm.workOrderId);
    }
    return nextSequence;
}
