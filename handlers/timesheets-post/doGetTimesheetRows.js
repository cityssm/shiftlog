import getTimesheetRows from '../../database/timesheets/getTimesheetRows.js';
export default async function handler(request, response) {
    const { timesheetId, ...filters } = request.body;
    const rows = await getTimesheetRows(timesheetId, filters);
    response.json({
        rows
    });
}
