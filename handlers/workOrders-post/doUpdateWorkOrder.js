import updateWorkOrder from '../../database/workOrders/updateWorkOrder.js';
export default async function handler(request, response) {
    try {
        const recordUpdate_timeMillis = await updateWorkOrder(request.body, request.session.user?.userName ?? '');
        response.json({
            success: true,
            recordUpdate_timeMillis
        });
    }
    catch (error) {
        console.error(error);
        response.json({
            success: false,
            message: error.message
        });
    }
}
