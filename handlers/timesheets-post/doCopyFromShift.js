import copyFromShift from '../../database/timesheets/copyFromShift.js';
export default async function handler(request, response) {
    const success = await copyFromShift(request.body.shiftId, request.body.timesheetId);
    response.json({
        success
    });
}
