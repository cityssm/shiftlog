import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
export default async function handler(_request, response) {
    const allNoteTypes = await getNoteTypes();
    const workOrderNoteTypes = allNoteTypes.filter((noteType) => noteType.isAvailableWorkOrders);
    response.json({
        noteTypes: workOrderNoteTypes
    });
}
