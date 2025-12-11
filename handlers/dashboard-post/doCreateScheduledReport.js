import createUserScheduledReport from '../../database/users/createUserScheduledReport.js';
export default async function handler(request, response) {
    const scheduledReportId = await createUserScheduledReport(request.session.user?.userName ?? '', request.body, request.session.user);
    response.json({
        success: scheduledReportId > 0,
        scheduledReportId
    });
}
