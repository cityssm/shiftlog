import deleteWorkOrderCost from '../../database/workOrders/deleteWorkOrderCost.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderCost(request.body.workOrderCostId, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
