import fs from 'node:fs';
import path from 'node:path';
import { getConfigProperty } from './config.helpers.js';
function sanitizeFileName(originalName) {
    let sanitized = originalName.replaceAll(/[\u0000-\u001F\u007F-\u009F]/g, '');
    sanitized = sanitized.replaceAll(/[<>:"/\\|?*]/g, '_');
    sanitized = sanitized.replace(/^\.+/, '');
    if (sanitized.length > 200) {
        const extension = path.extname(sanitized);
        const basename = path.basename(sanitized, extension);
        sanitized = basename.slice(0, 200 - extension.length) + extension;
    }
    if (sanitized.length === 0) {
        sanitized = 'attachment';
    }
    return sanitized;
}
export function getAttachmentStoragePathForFileName(originalName) {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const storagePath = getConfigProperty('application.attachmentStoragePath');
    const subfolderDirectory = path.join(year, month);
    const fullDirectory = path.join(storagePath, subfolderDirectory);
    if (!fs.existsSync(fullDirectory)) {
        fs.mkdirSync(fullDirectory, { recursive: true });
    }
    const timestamp = Date.now();
    const sanitizedFileName = sanitizeFileName(originalName);
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(fullDirectory, uniqueFileName);
    const fileSystemPath = path.join(subfolderDirectory, uniqueFileName);
    return {
        filePath,
        fileSystemPath
    };
}
