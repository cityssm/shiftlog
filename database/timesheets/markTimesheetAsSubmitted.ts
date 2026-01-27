import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function markTimesheetAsSubmitted(
  timesheetId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('timesheetId', timesheetId)
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.Timesheets
      SET
        recordSubmitted_dateTime = getdate(),
        recordSubmitted_userName = @userName
      WHERE
        timesheetId = @timesheetId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
        AND recordSubmitted_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
