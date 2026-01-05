import deleteTimesheetColumn from '../../database/timesheets/deleteTimesheetColumn.js';
export default async function handler(request, response) {
    const result = await deleteTimesheetColumn(request.body.timesheetColumnId);
    response.json(result);
}
