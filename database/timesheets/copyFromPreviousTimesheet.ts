import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function copyFromPreviousTimesheet(
  sourceTimesheetId: number | string,
  targetTimesheetId: number | string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  // Copy columns
  await pool
    .request()
    .input('sourceTimesheetId', sourceTimesheetId)
    .input('targetTimesheetId', targetTimesheetId).query(/* sql */ `
      insert into ShiftLog.TimesheetColumns (
        timesheetId,
        columnTitle,
        workOrderNumber,
        costCenterA,
        costCenterB,
        orderNumber
      )
      select
        @targetTimesheetId,
        columnTitle,
        workOrderNumber,
        costCenterA,
        costCenterB,
        orderNumber
      from ShiftLog.TimesheetColumns
      where timesheetId = @sourceTimesheetId
    `)

  // Copy rows
  await pool
    .request()
    .input('sourceTimesheetId', sourceTimesheetId)
    .input('targetTimesheetId', targetTimesheetId).query(/* sql */ `
      insert into ShiftLog.TimesheetRows (
        timesheetId,
        rowTitle,
        employeeNumber,
        equipmentNumber,
        jobClassificationDataListItemId,
        timeCodeDataListItemId
      )
      select
        @targetTimesheetId,
        rowTitle,
        employeeNumber,
        equipmentNumber,
        jobClassificationDataListItemId,
        timeCodeDataListItemId
      from ShiftLog.TimesheetRows
      where timesheetId = @sourceTimesheetId
    `)

  return true
}
