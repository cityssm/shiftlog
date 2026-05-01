import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import getWorkOrderAttachment from '../../database/workOrders/getWorkOrderAttachment.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
function encodeFilenameForContentDisposition(filename) {
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
    response.setHeader('Content-Disposition', `inline; ${encodeFilenameForContentDisposition(attachment.attachmentFileName)}`);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'private, max-age=3600');
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', () => {
        if (!response.headersSent) {
            response.status(500).send('Error reading file');
        }
        fileStream.destroy();
    });
    if (request.query.maxWidth !== undefined ||
        request.query.maxHeight !== undefined) {
        const width = request.query.maxWidth === undefined
            ? undefined
            : Number.parseInt(request.query.maxWidth, 10);
        const height = request.query.maxHeight === undefined
            ? undefined
            : Number.parseInt(request.query.maxHeight, 10);
        if ((width !== undefined && !Number.isNaN(width) && width > 0) ||
            (height !== undefined && !Number.isNaN(height) && height > 0)) {
            const transform = sharp().resize({
                height,
                width,
                fit: 'inside',
                withoutEnlargement: true
            });
            fileStream.pipe(transform).pipe(response);
            return;
        }
    }
    fileStream.pipe(response);
}
