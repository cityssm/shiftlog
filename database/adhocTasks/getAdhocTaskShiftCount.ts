import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function getAdhocTaskShiftCount(
  adhocTaskId: number | string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('adhocTaskId', adhocTaskId)
    .query<{
      recordCount: number
    }>(/* sql */ `
      SELECT
        count(*) AS recordCount
      FROM
        ShiftLog.ShiftAdhocTasks
      WHERE
        adhocTaskId = @adhocTaskId
    `)

  return result.recordset[0].recordCount
}
