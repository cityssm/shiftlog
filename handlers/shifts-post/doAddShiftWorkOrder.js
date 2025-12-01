import addShiftWorkOrder from '../../database/shifts/addShiftWorkOrder.js';
import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js';
export default async function handler(request, response) {
    const success = await addShiftWorkOrder(request.body.shiftId, request.body.workOrderId, request.body.shiftWorkOrderNote);
    if (success) {
        const shiftWorkOrders = await getShiftWorkOrders(request.body.shiftId);
        response.json({
            success: true,
            shiftWorkOrders
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: 'Failed to add work order to shift.'
        });
    }
}
