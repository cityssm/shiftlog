import getDeletedTimesheets from '../../database/timesheets/getDeletedTimesheets.js';
export default async function handler(request, response) {
    const timesheets = await getDeletedTimesheets(request.session.user);
    response.json({
        success: true,
        timesheets
    });
}
