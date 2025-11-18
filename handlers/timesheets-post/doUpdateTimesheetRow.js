import updateTimesheetRow from '../../database/timesheets/updateTimesheetRow.js';
export default async function handler(request, response) {
    const success = await updateTimesheetRow(request.body);
    response.json({
        success
    });
}
