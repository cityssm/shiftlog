import getTimesheetColumns from '../../database/timesheets/getTimesheetColumns.js';
export default async function handler(request, response) {
    const columns = await getTimesheetColumns(request.body.timesheetId);
    response.json({
        columns
    });
}
