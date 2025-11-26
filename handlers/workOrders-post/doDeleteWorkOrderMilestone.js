import deleteWorkOrderMilestone from '../../database/workOrders/deleteWorkOrderMilestone.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderMilestone(request.body.workOrderMilestoneId, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
