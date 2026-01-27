import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function isAdhocTaskOnShift(
  shiftId: number | string,
  adhocTaskId: number | string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('adhocTaskId', adhocTaskId)
    .query(/* sql */ `
      SELECT
        count(*) AS recordCount
      FROM
        ShiftLog.ShiftAdhocTasks
      WHERE
        shiftId = @shiftId
        AND adhocTaskId = @adhocTaskId
    `)) as mssql.IResult<{ recordCount: number }>

  return result.recordset[0].recordCount > 0
}
