import createWorkOrder from '../../database/workOrders/createWorkOrder.js';
export default async function handler(request, response) {
    const workOrderId = await createWorkOrder(request.body, request.session.user?.userName ?? '');
    response.json({
        success: true,
        workOrderId
    });
}
