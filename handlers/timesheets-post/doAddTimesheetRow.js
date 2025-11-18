import addTimesheetRow from '../../database/timesheets/addTimesheetRow.js';
export default async function handler(request, response) {
    const timesheetRowId = await addTimesheetRow(request.body);
    response.json({
        success: true,
        timesheetRowId
    });
}
