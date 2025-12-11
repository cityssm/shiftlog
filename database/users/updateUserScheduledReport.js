import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateUserScheduledReport(userName, form, sessionUser) {
    const pool = await getShiftLogConnectionPool();
    const isActive = form.isActive === undefined
        ? 1
        : form.isActive === true || form.isActive === 1 || form.isActive === '1'
            ? 1
            : 0;
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .input('scheduledReportId', form.scheduledReportId)
        .input('reportTitle', form.reportTitle)
        .input('reportParameters', form.reportParameters ?? null)
        .input('scheduleDaysOfWeek', form.scheduleDaysOfWeek)
        .input('scheduleTimeOfDay', form.scheduleTimeOfDay)
        .input('isActive', isActive)
        .input('recordUpdate_userName', sessionUser.userName)
        .input('recordUpdate_dateTime', new Date()).query(/* sql */ `
      update ShiftLog.UserScheduledReports
      set reportTitle = @reportTitle,
        reportParameters = @reportParameters,
        scheduleDaysOfWeek = @scheduleDaysOfWeek,
        scheduleTimeOfDay = @scheduleTimeOfDay,
        isActive = @isActive,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime
      where instance = @instance
        and userName = @userName
        and scheduledReportId = @scheduledReportId
        and recordDelete_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
