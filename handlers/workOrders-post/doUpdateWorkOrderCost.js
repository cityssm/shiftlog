import updateWorkOrderCost from '../../database/workOrders/updateWorkOrderCost.js';
export default async function handler(request, response) {
    const success = await updateWorkOrderCost(request.body, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
