import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function updateScheduledReportLastSent(
  scheduledReportId: number,
  nextScheduledDateTime?: Date,
  userName?: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const request = pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('scheduledReportId', scheduledReportId)
    .input('lastSentDate', today)
    .input('lastSentDateTime', now)
    .input('nextScheduledDateTime', nextScheduledDateTime ?? null)

  let sql = /* sql */ `
    update ShiftLog.UserScheduledReports
    set lastSentDate = @lastSentDate,
      lastSentDateTime = @lastSentDateTime,
      nextScheduledDateTime = @nextScheduledDateTime
    where instance = @instance
      and scheduledReportId = @scheduledReportId
      and recordDelete_dateTime is null
  `

  // Add userName constraint if provided for security
  if (userName) {
    request.input('userName', userName)
    sql += ' and userName = @userName'
  }

  const result = await request.query(sql)

  return result.rowsAffected[0] > 0
}
