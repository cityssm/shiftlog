import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js'

import getWorkOrder from './getWorkOrder.js'

export interface CreateWorkOrderNoteForm {
  fields?: Record<string, string>
  noteText: string
  noteTypeId?: number | string
  workOrderId: number | string

  recordCreate_dateTime?: Date
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

  const recordDateTime =
    createWorkOrderNoteForm.recordCreate_dateTime ?? new Date()

  // Insert the note
  const result = await pool
    .request()
    .input('workOrderId', createWorkOrderNoteForm.workOrderId)
    .input('noteSequence', nextSequence)
    .input('noteTypeId', createWorkOrderNoteForm.noteTypeId ?? null)
    .input('noteText', createWorkOrderNoteForm.noteText)
    .input('record_dateTime', recordDateTime)
    .input('userName', userName.slice(0, 30)) // Truncate to 30 characters to match database field length
    .query(/* sql */ `
      INSERT INTO
        ShiftLog.WorkOrderNotes (
          workOrderId,
          noteSequence,
          noteTypeId,
          noteText,
          recordCreate_dateTime,
          recordCreate_userName,
          recordUpdate_dateTime,
          recordUpdate_userName
        )
      VALUES
        (
          @workOrderId,
          @noteSequence,
          @noteTypeId,
          @noteText,
          @record_dateTime,
          @userName,
          @record_dateTime,
          @userName
        )
    `)

  if (result.rowsAffected[0] > 0) {
    // Insert field values if note type is set and fields are provided
    if (
      createWorkOrderNoteForm.noteTypeId !== undefined &&
      createWorkOrderNoteForm.fields !== undefined
    ) {
      for (const [noteTypeFieldId, fieldValue] of Object.entries(
        createWorkOrderNoteForm.fields
      )) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if ((fieldValue ?? '') !== '') {
          // eslint-disable-next-line no-await-in-loop -- inserting field values sequentially
          await pool
            .request()
            .input('workOrderId', createWorkOrderNoteForm.workOrderId)
            .input('noteSequence', nextSequence)
            .input('noteTypeFieldId', noteTypeFieldId)
            .input('fieldValue', fieldValue)
            .query(/* sql */ `
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
            `)
        }
      }
    }

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
