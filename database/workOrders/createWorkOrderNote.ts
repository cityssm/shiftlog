import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js'

import getWorkOrder from './getWorkOrder.js'

export interface CreateWorkOrderNoteForm {
  workOrderId: number | string
  noteText: string
}

export default async function createWorkOrderNote(
  createWorkOrderNoteForm: CreateWorkOrderNoteForm,
  userName: string
): Promise<number | undefined> {
  const workOrder = await getWorkOrder(createWorkOrderNoteForm.workOrderId)

  if (workOrder === undefined) {
    return undefined
  }

  const pool = await getShiftLogConnectionPool()

  // Get the next sequence number
  const sequenceResult = await pool
    .request()
    .input('workOrderId', createWorkOrderNoteForm.workOrderId)
    .query<{ nextSequence: number }>(/* sql */ `
      SELECT
        isnull(max(noteSequence), 0) + 1 AS nextSequence
      FROM
        ShiftLog.WorkOrderNotes
      WHERE
        workOrderId = @workOrderId
    `)

  const nextSequence = sequenceResult.recordset[0].nextSequence

  const result = await pool
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
    `)

  if (result.rowsAffected[0] > 0) {
    // Send Notification
    sendNotificationWorkerMessage(
      'workOrder.update',
      typeof createWorkOrderNoteForm.workOrderId === 'string'
        ? Number.parseInt(createWorkOrderNoteForm.workOrderId, 10)
        : createWorkOrderNoteForm.workOrderId
    )
  }

  return nextSequence
}
