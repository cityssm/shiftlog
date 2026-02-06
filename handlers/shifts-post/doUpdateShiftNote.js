import updateShiftNote from '../../database/shifts/updateShiftNote.js';
export default async function handler(request, response) {
    const success = await updateShiftNote(request.body, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
