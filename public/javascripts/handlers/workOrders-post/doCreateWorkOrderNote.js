import createWorkOrderNote from '../../database/workOrders/createWorkOrderNote.js';
export default async function handler(request, response) {
    const noteSequence = await createWorkOrderNote(request.body, request.session.user?.userName ?? '');
    if (noteSequence === undefined) {
        response.json({
            success: false,
            errorMessage: 'Work order not found.'
        });
        return;
    }
    response.json({
        success: true,
        noteSequence
    });
}
