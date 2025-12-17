import getShiftsForBuilder from '../../database/shifts/getShiftsForBuilder.js';
export default async function handler(request, response) {
    const shifts = await getShiftsForBuilder(request.body.shiftDateString, request.session.user);
    response.json({
        success: true,
        shifts
    });
}
