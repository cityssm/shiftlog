import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js';
export default async function handler(request, response) {
    const shiftWorkOrders = await getShiftWorkOrders(request.body.shiftId);
    response.json({
        success: true,
        shiftWorkOrders
    });
}
