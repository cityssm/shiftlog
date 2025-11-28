import fs from 'node:fs';
import path from 'node:path';
import createWorkOrderAttachment from '../../database/workOrders/createWorkOrderAttachment.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
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
    const attachmentDescription = (request.body.attachmentDescription ?? '');
    // Create year/month subdirectory structure
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const storagePath = getConfigProperty('application.attachmentStoragePath');
    const subDir = path.join(year, month);
    const fullDir = path.join(storagePath, subDir);
    // Ensure directory exists
    if (!fs.existsSync(fullDir)) {
        fs.mkdirSync(fullDir, { recursive: true });
    }
    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[<>:"/\\|?*]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(fullDir, uniqueFileName);
    const fileSystemPath = path.join(subDir, uniqueFileName);
    try {
        // Move file from temp location to permanent storage
        fs.renameSync(file.path, filePath);
        // Create database record
        const workOrderAttachmentId = await createWorkOrderAttachment({
            workOrderId,
            attachmentFileName: file.originalname,
            attachmentFileType: file.mimetype,
            attachmentFileSizeInBytes: file.size,
            attachmentDescription,
            fileSystemPath
        }, request.session.user?.userName ?? '');
        response.json({
            success: true,
            workOrderAttachmentId
        });
    }
    catch (error) {
        // Clean up uploaded file on error
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        response.json({
            success: false,
            message: 'Failed to save attachment.'
        });
    }
}
