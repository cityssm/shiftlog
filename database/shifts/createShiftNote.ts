import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

import getShift from './getShift.js'

export interface CreateShiftNoteForm {
  fields?: Record<string, string>
  noteText: string
  noteTypeId?: number | string
  shiftId: number | string
}

export default async function createShiftNote(
  createShiftNoteForm: CreateShiftNoteForm,
  userName: string
): Promise<number | undefined> {
  const shift = await getShift(createShiftNoteForm.shiftId)

  if (shift === undefined) {
    return undefined
  }

  const pool = await getShiftLogConnectionPool()

  // Get the next sequence number
  const sequenceResult = await pool
    .request()
    .input('shiftId', createShiftNoteForm.shiftId)
    .query<{ nextSequence: number }>(/* sql */ `
      SELECT
        isnull(max(noteSequence), 0) + 1 AS nextSequence
      FROM
        ShiftLog.ShiftNotes
      WHERE
        shiftId = @shiftId
    `)

  const nextSequence = sequenceResult.recordset[0].nextSequence

  // Insert the note
  const result = await pool
    .request()
    .input('shiftId', createShiftNoteForm.shiftId)
    .input('noteSequence', nextSequence)
    .input('noteTypeId', createShiftNoteForm.noteTypeId ?? null)
    .input('noteText', createShiftNoteForm.noteText)
    .input('userName', userName)
    .query(/* sql */ `
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
    `)

  if (result.rowsAffected[0] > 0 && // Insert field values if note type is set and fields are provided
    
      createShiftNoteForm.noteTypeId !== undefined &&
      createShiftNoteForm.fields !== undefined
    ) {
      for (const [noteTypeFieldId, fieldValue] of Object.entries(
        createShiftNoteForm.fields
      )) {
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          // eslint-disable-next-line no-await-in-loop -- inserting field values sequentially
          await pool
            .request()
            .input('shiftId', createShiftNoteForm.shiftId)
            .input('noteSequence', nextSequence)
            .input('noteTypeFieldId', noteTypeFieldId)
            .input('fieldValue', fieldValue)
            .query(/* sql */ `
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
            `)
        }
      }
    }

  return nextSequence
}
