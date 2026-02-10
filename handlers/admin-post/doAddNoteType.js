import addNoteType from '../../database/noteTypes/addNoteType.js';
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
export default async function handler(request, response) {
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
    const success = await addNoteType({
        isAvailableShifts,
        isAvailableTimesheets,
        isAvailableWorkOrders,
        noteType,
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
            message: 'Note type could not be added. Note type name may already exist.',
            success: false
        });
    }
}
