import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
export default async function handler(_request, response) {
    const allNoteTypes = await getNoteTypes();
    // Filter to only work order note types
    const workOrderNoteTypes = allNoteTypes.filter((noteType) => noteType.isAvailableWorkOrders);
    response.json({
        noteTypes: workOrderNoteTypes
    });
}
