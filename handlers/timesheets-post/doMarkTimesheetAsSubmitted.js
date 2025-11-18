import markTimesheetAsSubmitted from '../../database/timesheets/markTimesheetAsSubmitted.js';
export default async function handler(request, response) {
    const success = await markTimesheetAsSubmitted(request.body.timesheetId, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
