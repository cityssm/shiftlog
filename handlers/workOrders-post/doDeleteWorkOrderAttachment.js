import deleteWorkOrderAttachment from '../../database/workOrders/deleteWorkOrderAttachment.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderAttachment(request.body.workOrderAttachmentId, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
