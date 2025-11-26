import updateWorkOrderMilestone from '../../database/workOrders/updateWorkOrderMilestone.js';
export default async function handler(request, response) {
    const success = await updateWorkOrderMilestone(request.body, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
