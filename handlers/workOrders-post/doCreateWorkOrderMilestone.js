import createWorkOrderMilestone from '../../database/workOrders/createWorkOrderMilestone.js';
export default async function handler(request, response) {
    const workOrderMilestoneId = await createWorkOrderMilestone(request.body, request.session.user?.userName ?? '');
    response.json({
        success: true,
        workOrderMilestoneId
    });
}
