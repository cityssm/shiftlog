import addShiftEquipment from '../../database/shifts/addShiftEquipment.js';
export default async function handler(request, response) {
    const success = await addShiftEquipment(request.body);
    response.json({
        success
    });
}
