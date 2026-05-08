import getWorkOrderEquipment from '../../database/workOrders/getWorkOrderEquipment.js';
export default async function handler(request, response) {
    const { availableEquipment, workOrderEquipment } = await getWorkOrderEquipment(request.params.workOrderId, request.session.user);
    response.json({
        success: true,
        availableEquipment,
        workOrderEquipment
    });
}
