import updateShiftEmployeeNote from '../../database/shifts/updateShiftEmployeeNote.js';
export default async function handler(request, response) {
    const success = await updateShiftEmployeeNote(request.body);
    response.json({
        success
    });
}
