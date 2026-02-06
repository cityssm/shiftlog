import getShiftNotes from '../../database/shifts/getShiftNotes.js';
export default async function handler(request, response) {
    const notes = await getShiftNotes(request.params.shiftId);
    response.json({
        notes,
        success: true
    });
}
