import updateTimesheetColumn from '../../database/timesheets/updateTimesheetColumn.js';
export default async function handler(request, response) {
    const success = await updateTimesheetColumn(request.body);
    response.json({
        success
    });
}
