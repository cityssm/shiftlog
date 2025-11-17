import updateShiftCrewNote from '../../database/shifts/updateShiftCrewNote.js';
export default async function handler(request, response) {
    const success = await updateShiftCrewNote(request.body);
    response.json({
        success
    });
}
