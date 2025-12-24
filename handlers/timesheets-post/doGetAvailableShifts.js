import getShifts from '../../database/shifts/getShifts.js';
export default async function handler(request, response) {
    const { supervisorEmployeeNumber, shiftDateString } = request.body;
    const result = await getShifts({
        supervisorEmployeeNumber: supervisorEmployeeNumber ?? '',
        shiftDateString: shiftDateString ?? ''
    }, {
        limit: -1,
        offset: 0
    }, request.session.user);
    response.json({
        success: true,
        shifts: result.shifts
    });
}
