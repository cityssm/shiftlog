import getWorkOrderAttachments from '../../database/workOrders/getWorkOrderAttachments.js';
export default async function handler(request, response) {
    const attachments = await getWorkOrderAttachments(request.params.workOrderId);
    response.json({
        success: true,
        attachments
    });
}
