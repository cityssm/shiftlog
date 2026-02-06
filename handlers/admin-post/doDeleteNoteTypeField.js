import deleteNoteTypeField from '../../database/noteTypes/deleteNoteTypeField.js';
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
export default async function handler(request, response) {
    const noteTypeFieldId = Number.parseInt(request.body.noteTypeFieldId, 10);
    const success = await deleteNoteTypeField(noteTypeFieldId, request.session.user);
    if (success) {
        const noteTypes = await getNoteTypes();
        response.json({
            noteTypes,
            success: true
        });
    }
    else {
        response.json({
            message: 'Field could not be deleted.',
            success: false
        });
    }
}
