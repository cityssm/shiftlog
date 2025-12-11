import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteUserScheduledReport(
  userName: string,
  scheduledReportId: number | string,
  sessionUser: User
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .input('scheduledReportId', scheduledReportId)
    .input('recordDelete_userName', sessionUser.userName)
    .input('recordDelete_dateTime', new Date()).query(/* sql */ `
      update ShiftLog.UserScheduledReports
      set recordDelete_userName = @recordDelete_userName,
        recordDelete_dateTime = @recordDelete_dateTime
      where instance = @instance
        and userName = @userName
        and scheduledReportId = @scheduledReportId
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
