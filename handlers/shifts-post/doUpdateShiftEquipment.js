import updateShiftEquipment from '../../database/shifts/updateShiftEquipment.js';
export default async function handler(request, response) {
    const success = await updateShiftEquipment(request.body);
    response.json({
        success
    });
}
