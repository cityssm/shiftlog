import deleteShiftEmployee from '../../database/shifts/deleteShiftEmployee.js';
export default async function handler(request, response) {
    const success = await deleteShiftEmployee(request.body);
    response.json({
        success
    });
}
