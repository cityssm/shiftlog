import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
import reorderNoteTypeFields from '../../database/noteTypes/reorderNoteTypeFields.js';
export default async function handler(request, response) {
    const form = {
        ...request.body,
        userName: request.session.user?.userName ?? ''
    };
    const success = await reorderNoteTypeFields(form);
    let noteTypes;
    if (success) {
        noteTypes = await getNoteTypes();
    }
    response.json({
        success,
        noteTypes
    });
}
