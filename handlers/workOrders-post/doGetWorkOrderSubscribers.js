import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js';
export default async function handler(request, response) {
    const subscribers = await getWorkOrderSubscribers(request.params.workOrderId);
    response.json({
        success: true,
        subscribers
    });
}
