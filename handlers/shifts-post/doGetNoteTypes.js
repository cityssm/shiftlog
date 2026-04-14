import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
export default async function handler(_request, response) {
    const allNoteTypes = await getNoteTypes();
    const shiftNoteTypes = allNoteTypes.filter((noteType) => noteType.isAvailableShifts);
    response.json({
        noteTypes: shiftNoteTypes
    });
}
