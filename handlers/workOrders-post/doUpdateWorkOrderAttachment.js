import updateWorkOrderAttachment from '../../database/workOrders/updateWorkOrderAttachmentDescription.js';
export default async function handler(request, response) {
    const success = await updateWorkOrderAttachment(request.body, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
