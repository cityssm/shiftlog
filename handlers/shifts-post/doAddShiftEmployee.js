import addShiftEmployee from '../../database/shifts/addShiftEmployee.js';
export default async function handler(request, response) {
    const success = await addShiftEmployee(request.body);
    response.json({
        success
    });
}
