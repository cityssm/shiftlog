import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function markEquipmentAsEntered(
  timesheetId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('timesheetId', timesheetId)
    .input('userName', userName).query(/* sql */ `
      update ShiftLog.Timesheets
      set
        equipmentEntered_dateTime = getdate(),
        equipmentEntered_userName = @userName
      where timesheetId = @timesheetId
        and recordDelete_dateTime is null
        and recordSubmitted_dateTime is not null
        and equipmentEntered_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
