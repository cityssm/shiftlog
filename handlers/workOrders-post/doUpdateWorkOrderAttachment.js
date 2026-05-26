import updateWorkOrderAttachment from '../../database/workOrders/updateWorkOrderAttachmentDescription.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { TRANSCRIPTION_IN_PROGRESS } from '../../tasks/transcriptions/constants.js';
export default async function handler(request, response) {
    const generateWithTranscription = getConfigProperty('transcriptions.isEnabled') &&
        request.body.generateWithTranscription !== undefined;
    const success = await updateWorkOrderAttachment({
        workOrderAttachmentId: request.body.workOrderAttachmentId,
        attachmentDescription: generateWithTranscription
            ? TRANSCRIPTION_IN_PROGRESS
            : request.body.attachmentDescription
    }, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
