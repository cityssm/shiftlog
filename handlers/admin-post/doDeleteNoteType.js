import deleteNoteType from '../../database/noteTypes/deleteNoteType.js';
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
export default async function handler(request, response) {
    const noteTypeId = Number.parseInt(request.body.noteTypeId, 10);
    const success = await deleteNoteType(noteTypeId, request.session.user);
    if (success) {
        const noteTypes = await getNoteTypes();
        response.json({
            success: true,
            noteTypes
        });
    }
    else {
        response.json({
            success: false,
            message: 'Note type could not be deleted.'
        });
    }
}
