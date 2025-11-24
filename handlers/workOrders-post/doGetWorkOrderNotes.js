import getWorkOrderNotes from '../../database/workOrders/getWorkOrderNotes.js';
export default async function handler(request, response) {
    const notes = await getWorkOrderNotes(request.params.workOrderId);
    response.json({
        success: true,
        notes
    });
}
