import getUserScheduledReports from '../../database/users/getUserScheduledReports.js';
export default async function handler(request, response) {
    const scheduledReports = await getUserScheduledReports(request.session.user?.userName ?? '');
    response.json({
        success: true,
        scheduledReports
    });
}
