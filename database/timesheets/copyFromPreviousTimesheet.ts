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
        instance,
        timesheetId,
        rowTitle,
        employeeNumber,
        equipmentNumber,
        jobClassificationDataListItemId,
        timeCodeDataListItemId
      )
      select
        instance,
        @targetTimesheetId,
        rowTitle,
        employeeNumber,
        equipmentNumber,
        jobClassificationDataListItemId,
        timeCodeDataListItemId
      from ShiftLog.TimesheetRows
      where timesheetId = @sourceTimesheetId
    `)

  // Copy cells with remapped IDs
  await pool
    .request()
    .input('sourceTimesheetId', sourceTimesheetId)
    .input('targetTimesheetId', targetTimesheetId).query(/* sql */ `
      insert into ShiftLog.TimesheetCells (
        timesheetRowId,
        timesheetColumnId,
        recordHours
      )
      select
        newRow.timesheetRowId,
        newCol.timesheetColumnId,
        oldCell.recordHours
      from ShiftLog.TimesheetCells oldCell
      inner join ShiftLog.TimesheetRows oldRow
        on oldCell.timesheetRowId = oldRow.timesheetRowId
      inner join ShiftLog.TimesheetColumns oldCol
        on oldCell.timesheetColumnId = oldCol.timesheetColumnId
      inner join ShiftLog.TimesheetRows newRow
        on newRow.timesheetId = @targetTimesheetId
        and (
          (oldRow.employeeNumber is not null and newRow.employeeNumber = oldRow.employeeNumber)
          or (oldRow.equipmentNumber is not null and newRow.equipmentNumber = oldRow.equipmentNumber)
        )
      inner join ShiftLog.TimesheetColumns newCol
        on newCol.timesheetId = @targetTimesheetId
        and newCol.orderNumber = oldCol.orderNumber
      where oldRow.timesheetId = @sourceTimesheetId
        and oldCell.recordHours > 0
    `)

  return true
}
