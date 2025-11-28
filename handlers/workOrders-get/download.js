import fs from 'node:fs';
import path from 'node:path';
import getWorkOrderAttachment from '../../database/workOrders/getWorkOrderAttachment.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
function encodeFilenameForContentDisposition(filename) {
    // Use RFC 5987 encoding for non-ASCII characters and special chars
    const encodedFilename = encodeURIComponent(filename).replaceAll("'", '%27');
    return `filename*=UTF-8''${encodedFilename}`;
}
export default async function handler(request, response) {
    const attachment = await getWorkOrderAttachment(request.params.workOrderAttachmentId);
    if (attachment === undefined) {
        response.status(404).send('Attachment not found');
        return;
    }
    const storagePath = getConfigProperty('application.attachmentStoragePath');
    const filePath = path.join(storagePath, attachment.fileSystemPath);
    if (!fs.existsSync(filePath)) {
        response.status(404).send('File not found');
        return;
    }
    response.setHeader('Content-Type', attachment.attachmentFileType);
    response.setHeader('Content-Disposition', `attachment; ${encodeFilenameForContentDisposition(attachment.attachmentFileName)}`);
    response.setHeader('Content-Length', attachment.attachmentFileSizeInBytes);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(response);
}
