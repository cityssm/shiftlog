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
      UPDATE ShiftLog.Timesheets
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      WHERE
        timesheetId = @timesheetId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
        AND employeesEntered_dateTime IS NULL
        AND equipmentEntered_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
