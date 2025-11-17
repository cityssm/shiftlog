import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function markTimesheetAsSubmitted(
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
        recordSubmitted_dateTime = getdate(),
        recordSubmitted_userName = @userName
      where timesheetId = @timesheetId
        and recordDelete_dateTime is null
        and recordSubmitted_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
