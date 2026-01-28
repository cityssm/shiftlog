import updateShiftAdhocTaskNote from '../../database/adhocTasks/updateShiftAdhocTaskNote.js';
export default async function handler(request, response) {
    const success = await updateShiftAdhocTaskNote(request.body.shiftId, request.body.adhocTaskId, request.body.shiftAdhocTaskNote);
    if (success) {
        response.json({
            success: true
        });
        return;
    }
    response.json({
        success: false,
        errorMessage: 'Failed to update task note.'
    });
}
