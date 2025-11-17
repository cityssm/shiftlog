import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { TimesheetColumn } from '../../types/record.types.js'

export default async function getTimesheetColumns(
  timesheetId: number | string
): Promise<TimesheetColumn[]> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    select
      timesheetColumnId,
      timesheetId,
      columnTitle,
      workOrderNumber,
      costCenterA,
      costCenterB,
      orderNumber
    from ShiftLog.TimesheetColumns
    where timesheetId = @timesheetId
    order by orderNumber, timesheetColumnId
  `

  const result = (await pool
    .request()
    .input('timesheetId', timesheetId)
    .query(sql)) as mssql.IResult<TimesheetColumn>

  return result.recordset
}
