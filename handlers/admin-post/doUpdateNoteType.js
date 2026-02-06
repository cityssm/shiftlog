import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
import updateNoteType from '../../database/noteTypes/updateNoteType.js';
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
        isAvailableShifts,
        isAvailableTimesheets,
        isAvailableWorkOrders,
        noteType,
        noteTypeId,
        userGroupId
    }, request.session.user);
    if (success) {
        const noteTypes = await getNoteTypes();
        response.json({
            noteTypes,
            success: true
        });
    }
    else {
        response.json({
            message: 'Note type could not be updated.',
            success: false
        });
    }
}
