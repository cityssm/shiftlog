import addTimesheetColumn from '../../database/timesheets/addTimesheetColumn.js';
export default async function handler(request, response) {
    const timesheetColumnId = await addTimesheetColumn(request.body);
    response.json({
        success: true,
        timesheetColumnId
    });
}
