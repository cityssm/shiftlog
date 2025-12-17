import getShiftEmployees from '../../database/shifts/getShiftEmployees.js';
export default async function handler(request, response) {
    const shiftEmployees = await getShiftEmployees(request.body.shiftId, request.session.user);
    response.json({
        success: true,
        shiftEmployees
    });
}
