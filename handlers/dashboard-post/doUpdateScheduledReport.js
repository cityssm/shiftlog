import updateUserScheduledReport from '../../database/users/updateUserScheduledReport.js';
export default async function handler(request, response) {
    const success = await updateUserScheduledReport(request.session.user?.userName ?? '', request.body, request.session.user);
    response.json({
        success
    });
}
