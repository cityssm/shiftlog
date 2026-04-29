import fs from 'node:fs';
import Debug from 'debug';
import createWorkOrderAttachment from '../../database/workOrders/createWorkOrderAttachment.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getAttachmentStoragePathForFileName } from '../../helpers/upload.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:workOrders-post:doUploadWorkOrderAttachment`);
export default async function handler(request, response) {
    const file = request.file;
    if (file === undefined) {
        response.json({
            success: false,
            message: 'No file uploaded.'
        });
        return;
    }
    const workOrderId = request.body.workOrderId;
    const attachmentDescription = (request.body.attachmentDescription ??
        '');
    const { filePath, fileSystemPath } = getAttachmentStoragePathForFileName(file.originalname);
    try {
        fs.renameSync(file.path, filePath);
        const workOrderAttachmentId = await createWorkOrderAttachment({
            workOrderId,
            attachmentFileName: file.originalname,
            attachmentFileType: file.mimetype,
            attachmentFileSizeInBytes: file.size,
            attachmentDescription,
            fileSystemPath
        }, request.session.user?.userName ?? '');
        if (workOrderAttachmentId === undefined) {
            throw new Error('Work order not found');
        }
        response.json({
            success: true,
            workOrderAttachmentId
        });
    }
    catch (error) {
        debug(`Error uploading attachment for ${getConfigProperty('workOrders.sectionNameSingular')} %s: %O`, workOrderId, error);
        try {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (cleanupError) {
            debug('Error cleaning up files after upload failure: %O', cleanupError);
        }
        response.json({
            success: false,
            message: 'Failed to save attachment.'
        });
    }
}
