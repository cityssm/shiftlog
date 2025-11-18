import updateTimesheetCell from '../../database/timesheets/updateTimesheetCell.js';
export default async function handler(request, response) {
    const success = await updateTimesheetCell(request.body);
    response.json({
        success
    });
}
