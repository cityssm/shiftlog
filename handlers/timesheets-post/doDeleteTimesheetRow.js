import deleteTimesheetRow from '../../database/timesheets/deleteTimesheetRow.js';
export default async function handler(request, response) {
    const success = await deleteTimesheetRow(request.body.timesheetRowId);
    response.json({
        success
    });
}
