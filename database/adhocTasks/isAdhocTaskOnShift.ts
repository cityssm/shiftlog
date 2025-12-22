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
    .query(
      /* sql */ `
        select count(*) as recordCount
        from ShiftLog.ShiftAdhocTasks
        where shiftId = @shiftId
          and adhocTaskId = @adhocTaskId
      `
    )) as mssql.IResult<{ recordCount: number }>

  return result.recordset[0].recordCount > 0
}
