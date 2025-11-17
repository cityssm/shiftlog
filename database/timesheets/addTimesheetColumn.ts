import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface AddTimesheetColumnForm {
  timesheetId: number | string
  columnTitle: string
  workOrderNumber?: string
  costCenterA?: string
  costCenterB?: string
}

export default async function addTimesheetColumn(
  addColumnForm: AddTimesheetColumnForm
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  // Get the next order number
  const maxOrderResult = await pool
    .request()
    .input('timesheetId', addColumnForm.timesheetId).query(/* sql */ `
      select isnull(max(orderNumber), -1) + 1 as nextOrderNumber
      from ShiftLog.TimesheetColumns
      where timesheetId = @timesheetId
    `)

  const nextOrderNumber = maxOrderResult.recordset[0].nextOrderNumber

  const result = (await pool
    .request()
    .input('timesheetId', addColumnForm.timesheetId)
    .input('columnTitle', addColumnForm.columnTitle)
    .input('workOrderNumber', addColumnForm.workOrderNumber ?? null)
    .input('costCenterA', addColumnForm.costCenterA ?? null)
    .input('costCenterB', addColumnForm.costCenterB ?? null)
    .input('orderNumber', nextOrderNumber).query(/* sql */ `
      insert into ShiftLog.TimesheetColumns (
        timesheetId,
        columnTitle,
        workOrderNumber,
        costCenterA,
        costCenterB,
        orderNumber
      )
      output inserted.timesheetColumnId
      values (
        @timesheetId,
        @columnTitle,
        @workOrderNumber,
        @costCenterA,
        @costCenterB,
        @orderNumber
      )
    `)) as mssql.IResult<{ timesheetColumnId: number }>

  return result.recordset[0].timesheetColumnId
}
