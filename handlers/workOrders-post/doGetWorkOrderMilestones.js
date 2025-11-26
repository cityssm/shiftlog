import getWorkOrderMilestones from '../../database/workOrders/getWorkOrderMilestones.js';
export default async function handler(request, response) {
    const milestones = await getWorkOrderMilestones(request.params.workOrderId);
    response.json({
        success: true,
        milestones
    });
}
