import getTimesheetsByShift from '../../database/timesheets/getTimesheetsByShift.js';
export default async function handler(request, response) {
    const timesheets = await getTimesheetsByShift(request.body.shiftId, request.session.user);
    response.json({
        success: true,
        timesheets
    });
}
