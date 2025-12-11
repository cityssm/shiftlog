import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function updateScheduledReportLastSent(
  scheduledReportId: number,
  nextScheduledDateTime?: Date
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('scheduledReportId', scheduledReportId)
    .input('lastSentDate', today)
    .input('lastSentDateTime', now)
    .input('nextScheduledDateTime', nextScheduledDateTime ?? null)
    .query(/* sql */ `
      update ShiftLog.UserScheduledReports
      set lastSentDate = @lastSentDate,
        lastSentDateTime = @lastSentDateTime,
        nextScheduledDateTime = @nextScheduledDateTime
      where instance = @instance
        and scheduledReportId = @scheduledReportId
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
