import createWorkOrderMilestone from '../../database/workOrders/createWorkOrderMilestone.js';
export default async function handler(request, response) {
    const workOrderMilestoneId = await createWorkOrderMilestone(request.body, request.session.user?.userName ?? '');
    if (workOrderMilestoneId === undefined) {
        response.json({
            success: false,
            errorMessage: 'Work order not found.'
        });
        return;
    }
    response.json({
        success: true,
        workOrderMilestoneId
    });
}
