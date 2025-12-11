import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function createUserScheduledReport(userName, form, sessionUser) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .input('reportType', form.reportType)
        .input('reportTitle', form.reportTitle)
        .input('reportParameters', form.reportParameters ?? null)
        .input('scheduleDaysOfWeek', form.scheduleDaysOfWeek)
        .input('scheduleTimeOfDay', form.scheduleTimeOfDay)
        .input('recordCreate_userName', sessionUser.userName)
        .input('recordUpdate_userName', sessionUser.userName)
        .query(/* sql */ `
      insert into ShiftLog.UserScheduledReports (
        instance,
        userName,
        reportType,
        reportTitle,
        reportParameters,
        scheduleDaysOfWeek,
        scheduleTimeOfDay,
        recordCreate_userName,
        recordUpdate_userName
      ) values (
        @instance,
        @userName,
        @reportType,
        @reportTitle,
        @reportParameters,
        @scheduleDaysOfWeek,
        @scheduleTimeOfDay,
        @recordCreate_userName,
        @recordUpdate_userName
      );
      
      select scope_identity() as scheduledReportId
    `);
    return result.recordset[0].scheduledReportId;
}
