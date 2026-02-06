import createShiftNote from '../../database/shifts/createShiftNote.js';
export default async function handler(request, response) {
    const noteSequence = await createShiftNote(request.body, request.session.user?.userName ?? '');
    if (noteSequence === undefined) {
        response.json({
            errorMessage: 'Shift not found.',
            success: false
        });
        return;
    }
    response.json({
        noteSequence,
        success: true
    });
}
