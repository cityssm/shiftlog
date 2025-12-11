import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getUserScheduledReports(userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .query(/* sql */ `
      select
        scheduledReportId,
        userName,
        reportType,
        reportTitle,
        reportParameters,
        scheduleDaysOfWeek,
        scheduleTimeOfDay,
        lastSentDate,
        lastSentDateTime,
        nextScheduledDateTime,
        isActive,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime
      from ShiftLog.UserScheduledReports
      where instance = @instance
        and userName = @userName
        and recordDelete_dateTime is null
      order by reportTitle, scheduledReportId
    `);
    return result.recordset.map((report) => {
        if (report.reportParameters) {
            try {
                report.reportParametersJson = JSON.parse(report.reportParameters);
            }
            catch {
                // Invalid JSON, ignore
            }
        }
        return report;
    });
}
