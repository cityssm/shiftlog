import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
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
      and timesheetId in (
        select timesheetId
        from ShiftLog.Timesheets
        where instance = @instance
      )
    order by orderNumber, timesheetColumnId
  `

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('timesheetId', timesheetId)
    .query(sql)) as mssql.IResult<TimesheetColumn>

  return result.recordset
}
