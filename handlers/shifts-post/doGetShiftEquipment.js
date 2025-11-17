import getShiftEquipment from '../../database/shifts/getShiftEquipment.js';
export default async function handler(request, response) {
    const shiftEquipment = await getShiftEquipment(request.body.shiftId, request.session.user);
    response.json({
        success: true,
        shiftEquipment
    });
}
