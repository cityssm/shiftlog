import updateWorkOrder from '../../database/workOrders/updateWorkOrder.js';
export default async function handler(request, response) {
    const success = await updateWorkOrder(request.body, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
