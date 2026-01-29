import createWorkOrderCost from '../../database/workOrders/createWorkOrderCost.js';
export default async function handler(request, response) {
    const workOrderCostId = await createWorkOrderCost(request.body, request.session.user?.userName ?? '');
    if (workOrderCostId === undefined) {
        response.json({
            success: false,
            errorMessage: 'Work order not found.'
        });
        return;
    }
    response.json({
        success: true,
        workOrderCostId
    });
}
