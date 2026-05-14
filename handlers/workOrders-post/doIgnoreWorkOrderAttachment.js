import ignoreWorkOrderAttachment from '../../database/workOrders/ignoreWorkOrderAttachment.js';
export default async function handler(request, response) {
    const success = await ignoreWorkOrderAttachment(request.body.workOrderAttachmentId, request.body.noteText.trim(), request.session.user?.userName ?? '');
    if (success) {
        response.json({
            success: true
        });
    }
    else {
        response.json({
            success: false,
            message: 'The attachment could not be ignored. Ensure the attachment has a checksum.'
        });
    }
}
