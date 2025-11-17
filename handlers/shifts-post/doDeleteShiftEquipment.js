import deleteShiftEquipment from '../../database/shifts/deleteShiftEquipment.js';
export default async function handler(request, response) {
    const success = await deleteShiftEquipment(request.body);
    response.json({
        success
    });
}
