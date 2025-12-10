import getWorkOrderCosts from '../../database/workOrders/getWorkOrderCosts.js';
export default async function handler(request, response) {
    const costs = await getWorkOrderCosts(request.params.workOrderId);
    response.json({
        success: true,
        costs
    });
}
