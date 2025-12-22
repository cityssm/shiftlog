import updateShiftAdhocTaskNote from '../../database/adhocTasks/updateShiftAdhocTaskNote.js';
export default async function handler(request, response) {
    const success = await updateShiftAdhocTaskNote(request.body.shiftId, request.body.adhocTaskId, request.body.shiftAdhocTaskNote);
    response.json({
        success,
        errorMessage: success ? undefined : 'Failed to update task note.'
    });
}
