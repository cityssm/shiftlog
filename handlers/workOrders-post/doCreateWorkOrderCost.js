import createWorkOrderCost from '../../database/workOrders/createWorkOrderCost.js';
export default async function handler(request, response) {
    const workOrderCostId = await createWorkOrderCost(request.body, request.session.user?.userName ?? '');
    response.json({
        success: true,
        workOrderCostId
    });
}
