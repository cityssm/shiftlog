import updateTimesheet from '../../database/timesheets/updateTimesheet.js';
export default async function handler(request, response) {
    const success = await updateTimesheet(request.body, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
