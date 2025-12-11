import deleteUserScheduledReport from '../../database/users/deleteUserScheduledReport.js';
export default async function handler(request, response) {
    const success = await deleteUserScheduledReport(request.session.user?.userName ?? '', request.body.scheduledReportId, request.session.user);
    response.json({
        success
    });
}
