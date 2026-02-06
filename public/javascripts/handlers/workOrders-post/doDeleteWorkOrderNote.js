import deleteWorkOrderNote from '../../database/workOrders/deleteWorkOrderNote.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderNote(request.body.workOrderId, request.body.noteSequence, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
