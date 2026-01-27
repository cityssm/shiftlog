import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateWorkOrderNoteForm {
  workOrderId: number | string
  noteSequence: number | string
  noteText: string
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

  return result.rowsAffected[0] > 0
}
