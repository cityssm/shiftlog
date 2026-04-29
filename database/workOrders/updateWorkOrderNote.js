import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js';
export default async function updateWorkOrderNote(updateWorkOrderNoteForm, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderId', updateWorkOrderNoteForm.workOrderId)
        .input('noteSequence', updateWorkOrderNoteForm.noteSequence)
        .input('noteText', updateWorkOrderNoteForm.noteText)
        .input('userName', userName)
        .query(`
      UPDATE ShiftLog.WorkOrderNotes
      SET
        noteText = @noteText,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        workOrderId = @workOrderId
        AND noteSequence = @noteSequence
        AND recordDelete_dateTime IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
    `);
    if (result.rowsAffected[0] > 0) {
        if (updateWorkOrderNoteForm.fields !== undefined) {
            for (const [noteTypeFieldId, fieldValue] of Object.entries(updateWorkOrderNoteForm.fields)) {
                if (fieldValue !== undefined && fieldValue !== null) {
                    const existingField = await pool
                        .request()
                        .input('workOrderId', updateWorkOrderNoteForm.workOrderId)
                        .input('noteSequence', updateWorkOrderNoteForm.noteSequence)
                        .input('noteTypeFieldId', noteTypeFieldId)
                        .query(`
              SELECT
                COUNT(*) AS count
              FROM
                ShiftLog.WorkOrderNoteFields
              WHERE
                workOrderId = @workOrderId
                AND noteSequence = @noteSequence
                AND noteTypeFieldId = @noteTypeFieldId
            `);
                    if (existingField.recordset[0].count > 0) {
                        await pool
                            .request()
                            .input('workOrderId', updateWorkOrderNoteForm.workOrderId)
                            .input('noteSequence', updateWorkOrderNoteForm.noteSequence)
                            .input('noteTypeFieldId', noteTypeFieldId)
                            .input('fieldValue', fieldValue)
                            .query(`
                UPDATE ShiftLog.WorkOrderNoteFields
                SET
                  fieldValue = @fieldValue
                WHERE
                  workOrderId = @workOrderId
                  AND noteSequence = @noteSequence
                  AND noteTypeFieldId = @noteTypeFieldId
              `);
                    }
                    else {
                        await pool
                            .request()
                            .input('workOrderId', updateWorkOrderNoteForm.workOrderId)
                            .input('noteSequence', updateWorkOrderNoteForm.noteSequence)
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
        }
        sendNotificationWorkerMessage('workOrder.update', typeof updateWorkOrderNoteForm.workOrderId === 'string'
            ? Number.parseInt(updateWorkOrderNoteForm.workOrderId, 10)
            : updateWorkOrderNoteForm.workOrderId);
    }
    return result.rowsAffected[0] > 0;
}
