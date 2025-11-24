// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, unicorn/no-null */

import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateWorkOrderNoteForm {
  workOrderId: number | string
  noteText: string
}

export default async function createWorkOrderNote(
  createWorkOrderNoteForm: CreateWorkOrderNoteForm,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  // Get the next sequence number
  const sequenceResult = (await pool
    .request()
    .input('workOrderId', createWorkOrderNoteForm.workOrderId).query(/* sql */ `
      select isnull(max(noteSequence), 0) + 1 as nextSequence
      from ShiftLog.WorkOrderNotes
      where workOrderId = @workOrderId
    `)) as mssql.IResult<{ nextSequence: number }>

  const nextSequence = sequenceResult.recordset[0].nextSequence

  await pool
    .request()
    .input('workOrderId', createWorkOrderNoteForm.workOrderId)
    .input('noteSequence', nextSequence)
    .input('noteText', createWorkOrderNoteForm.noteText)
    .input('userName', userName).query(/* sql */ `
      insert into ShiftLog.WorkOrderNotes (
        workOrderId,
        noteSequence,
        noteText,
        recordCreate_userName,
        recordUpdate_userName
      )
      values (
        @workOrderId,
        @noteSequence,
        @noteText,
        @userName,
        @userName
      )
    `)

  return nextSequence
}
