import createWorkOrderNote from '../../database/workOrders/createWorkOrderNote.js';
export default async function handler(request, response) {
    const noteSequence = await createWorkOrderNote(request.body, request.session.user?.userName ?? '');
    response.json({
        success: true,
        noteSequence
    });
}
