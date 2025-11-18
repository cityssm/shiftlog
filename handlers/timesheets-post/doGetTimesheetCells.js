import getTimesheetCells from '../../database/timesheets/getTimesheetCells.js';
export default async function handler(request, response) {
    const cells = await getTimesheetCells(request.body.timesheetId);
    response.json({
        cells
    });
}
