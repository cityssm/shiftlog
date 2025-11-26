import updateWorkOrderMilestoneOrder from '../../database/workOrders/updateWorkOrderMilestoneOrder.js';
export default async function handler(request, response) {
    const success = await updateWorkOrderMilestoneOrder(request.body.milestoneOrders, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
