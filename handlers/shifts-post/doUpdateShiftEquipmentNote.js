import updateShiftEquipmentNote from '../../database/shifts/updateShiftEquipmentNote.js';
export default async function handler(request, response) {
    const success = await updateShiftEquipmentNote(request.body);
    response.json({
        success
    });
}
