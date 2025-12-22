import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteShiftAdhocTask(
  shiftId: number | string,
  adhocTaskId: number | string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('shiftId', shiftId)
    .input('adhocTaskId', adhocTaskId)
    .query(
      /* sql */ `
        delete from ShiftLog.ShiftAdhocTasks
        where shiftId = @shiftId
          and adhocTaskId = @adhocTaskId
      `
    )

  return result.rowsAffected[0] > 0
}
