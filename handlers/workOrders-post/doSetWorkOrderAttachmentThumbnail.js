import setWorkOrderAttachmentThumbnail from '../../database/workOrders/setWorkOrderAttachmentThumbnail.js';
export default async function handler(request, response) {
    const success = await setWorkOrderAttachmentThumbnail(request.body.workOrderAttachmentId, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
