import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function isAdhocTaskOnShift(
  shiftId: number | string,
  adhocTaskId: number | string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('shiftId', shiftId)
    .input('adhocTaskId', adhocTaskId)
    .query<{ recordCount: number }>(/* sql */ `
      SELECT
        count(*) AS recordCount
      FROM
        ShiftLog.ShiftAdhocTasks
      WHERE
        shiftId = @shiftId
        AND adhocTaskId = @adhocTaskId
    `)

  return result.recordset[0].recordCount > 0
}
