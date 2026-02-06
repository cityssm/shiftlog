import updateNoteType from '../../database/noteTypes/updateNoteType.js';
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
export default async function handler(request, response) {
    const noteTypeId = Number.parseInt(request.body.noteTypeId, 10);
    const noteType = request.body.noteType ?? '';
    const userGroupId = request.body.userGroupId === '' || request.body.userGroupId === undefined
        ? null
        : Number.parseInt(request.body.userGroupId, 10);
    const isAvailableWorkOrders = request.body.isAvailableWorkOrders === true ||
        request.body.isAvailableWorkOrders === '1';
    const isAvailableShifts = request.body.isAvailableShifts === true ||
        request.body.isAvailableShifts === '1';
    const isAvailableTimesheets = request.body.isAvailableTimesheets === true ||
        request.body.isAvailableTimesheets === '1';
    const success = await updateNoteType({
        noteTypeId,
        noteType,
        userGroupId,
        isAvailableWorkOrders,
        isAvailableShifts,
        isAvailableTimesheets
    }, request.session.user);
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
            message: 'Note type could not be updated.'
        });
    }
}
