import updateShiftWorkOrderNote from '../../database/shifts/updateShiftWorkOrderNote.js';
export default async function handler(request, response) {
    const success = await updateShiftWorkOrderNote(request.body.shiftId, request.body.workOrderId, request.body.shiftWorkOrderNote);
    response.json({
        success,
        errorMessage: success ? undefined : 'Failed to update note.'
    });
}
