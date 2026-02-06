import deleteShiftNote from '../../database/shifts/deleteShiftNote.js';
export default async function handler(request, response) {
    const success = await deleteShiftNote(request.body.shiftId, request.body.noteSequence, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
