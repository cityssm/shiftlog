import updateShiftEmployee from '../../database/shifts/updateShiftEmployee.js';
export default async function handler(request, response) {
    const success = await updateShiftEmployee(request.body);
    response.json({
        success
    });
}
