import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
export default async function handler(_request, response) {
    const allNoteTypes = await getNoteTypes();
    // Filter to only shift note types
    const shiftNoteTypes = allNoteTypes.filter((noteType) => noteType.isAvailableShifts);
    response.json({
        noteTypes: shiftNoteTypes
    });
}
