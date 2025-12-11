import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getAllActiveScheduledReports() {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      select
        r.scheduledReportId,
        r.userName,
        r.reportType,
        r.reportTitle,
        r.reportParameters,
        r.scheduleDaysOfWeek,
        r.scheduleTimeOfDay,
        r.lastSentDate,
        r.lastSentDateTime,
        r.nextScheduledDateTime,
        r.isActive,
        r.recordCreate_userName,
        r.recordCreate_dateTime,
        r.recordUpdate_userName,
        r.recordUpdate_dateTime,
        u.employeeNumber,
        u.firstName,
        u.lastName
      from ShiftLog.UserScheduledReports r
      inner join ShiftLog.Users u
        on r.instance = u.instance
        and r.userName = u.userName
      where r.instance = @instance
        and r.isActive = 1
        and r.recordDelete_dateTime is null
        and u.isActive = 1
        and u.recordDelete_dateTime is null
      order by r.nextScheduledDateTime, r.scheduledReportId
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
