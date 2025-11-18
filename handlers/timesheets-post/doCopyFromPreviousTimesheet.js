import copyFromPreviousTimesheet from '../../database/timesheets/copyFromPreviousTimesheet.js';
export default async function handler(request, response) {
    const success = await copyFromPreviousTimesheet(request.body.sourceTimesheetId, request.body.targetTimesheetId);
    response.json({
        success
    });
}
