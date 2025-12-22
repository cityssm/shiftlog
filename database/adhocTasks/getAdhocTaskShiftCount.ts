import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function getAdhocTaskShiftCount(
  adhocTaskId: number | string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('adhocTaskId', adhocTaskId)
    .query(
      /* sql */ `
        select count(*) as recordCount
        from ShiftLog.ShiftAdhocTasks
        where adhocTaskId = @adhocTaskId
      `
    )) as mssql.IResult<{ recordCount: number }>

  return result.recordset[0].recordCount
}
