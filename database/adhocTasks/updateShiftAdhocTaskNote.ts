import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function updateShiftAdhocTaskNote(
  shiftId: number | string,
  adhocTaskId: number | string,
  shiftAdhocTaskNote: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('shiftId', shiftId)
    .input('adhocTaskId', adhocTaskId)
    .input('shiftAdhocTaskNote', shiftAdhocTaskNote).query(/* sql */ `
      update ShiftLog.ShiftAdhocTasks
      set shiftAdhocTaskNote = @shiftAdhocTaskNote
      where shiftId = @shiftId
        and adhocTaskId = @adhocTaskId
    `)

  return result.rowsAffected[0] > 0
}
