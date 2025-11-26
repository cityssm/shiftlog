import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteTimesheet(
  timesheetId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('timesheetId', timesheetId)
    .input('userName', userName)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      update ShiftLog.Timesheets
      set
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      where timesheetId = @timesheetId
        and instance = @instance
        and recordDelete_dateTime is null
        and employeesEntered_dateTime is null
        and equipmentEntered_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
