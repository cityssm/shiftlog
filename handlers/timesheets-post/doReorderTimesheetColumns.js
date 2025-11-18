import reorderTimesheetColumns from '../../database/timesheets/reorderTimesheetColumns.js';
export default async function handler(request, response) {
    const success = await reorderTimesheetColumns(request.body);
    response.json({
        success
    });
}
