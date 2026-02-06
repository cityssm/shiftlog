import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateWorkOrderNoteForm {
  workOrderId: number | string
  noteSequence: number | string
  noteText: string
  fields?: Record<string, string>
}

export default async function updateWorkOrderNote(
  updateWorkOrderNoteForm: UpdateWorkOrderNoteForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderId', updateWorkOrderNoteForm.workOrderId)
    .input('noteSequence', updateWorkOrderNoteForm.noteSequence)
    .input('noteText', updateWorkOrderNoteForm.noteText)
    .input('userName', userName)
    .query(/* sql */ `
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
    `)

  if (result.rowsAffected[0] > 0) {
    // Update field values if fields are provided
    if (updateWorkOrderNoteForm.fields !== undefined) {
      for (const [noteTypeFieldId, fieldValue] of Object.entries(
        updateWorkOrderNoteForm.fields
      )) {
        if (fieldValue !== undefined && fieldValue !== null) {
          // Check if field value already exists
          const existingField = await pool
            .request()
            .input('workOrderId', updateWorkOrderNoteForm.workOrderId)
            .input('noteSequence', updateWorkOrderNoteForm.noteSequence)
            .input('noteTypeFieldId', noteTypeFieldId)
            .query(/* sql */ `
              SELECT COUNT(*) as count
              FROM ShiftLog.WorkOrderNoteFields
              WHERE workOrderId = @workOrderId
                AND noteSequence = @noteSequence
                AND noteTypeFieldId = @noteTypeFieldId
            `)

          if (existingField.recordset[0].count > 0) {
            // Update existing field
            await pool
              .request()
              .input('workOrderId', updateWorkOrderNoteForm.workOrderId)
              .input('noteSequence', updateWorkOrderNoteForm.noteSequence)
              .input('noteTypeFieldId', noteTypeFieldId)
              .input('fieldValue', fieldValue)
              .query(/* sql */ `
                UPDATE ShiftLog.WorkOrderNoteFields
                SET fieldValue = @fieldValue
                WHERE workOrderId = @workOrderId
                  AND noteSequence = @noteSequence
                  AND noteTypeFieldId = @noteTypeFieldId
              `)
          } else {
            // Insert new field (for backwards compatibility with existing notes)
            await pool
              .request()
              .input('workOrderId', updateWorkOrderNoteForm.workOrderId)
              .input('noteSequence', updateWorkOrderNoteForm.noteSequence)
              .input('noteTypeFieldId', noteTypeFieldId)
              .input('fieldValue', fieldValue)
              .query(/* sql */ `
                INSERT INTO ShiftLog.WorkOrderNoteFields (
                  workOrderId,
                  noteSequence,
                  noteTypeFieldId,
                  fieldValue
                )
                VALUES (
                  @workOrderId,
                  @noteSequence,
                  @noteTypeFieldId,
                  @fieldValue
                )
              `)
          }
        }
      }
    }
  }

  return result.rowsAffected[0] > 0
}
