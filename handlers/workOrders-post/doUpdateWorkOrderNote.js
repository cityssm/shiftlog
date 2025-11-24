import updateWorkOrderNote from '../../database/workOrders/updateWorkOrderNote.js';
export default async function handler(request, response) {
    const success = await updateWorkOrderNote(request.body, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
