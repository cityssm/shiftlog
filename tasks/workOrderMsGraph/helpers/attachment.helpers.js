import crypto from 'node:crypto';
import fs from 'node:fs/promises';
export function attachmentContentBytesToBuffer(attachmentContentBytes) {
    return Buffer.from(attachmentContentBytes, 'base64');
}
export function attachmentContentBytesToChecksum(attachmentContentBuffer) {
    const checksum = crypto
        .createHash('sha256')
        .update(attachmentContentBuffer)
        .digest('hex');
    return checksum;
}
export async function writeAttachmentToFileSystem(filePath, attachmentContentBuffer) {
    await fs.writeFile(filePath, attachmentContentBuffer);
    const stats = await fs.stat(filePath);
    return stats.size;
}
export function getAttachmentFileNameFromFileName(fileName) {
    if (fileName.length > 500) {
        const extensionIndex = fileName.lastIndexOf('.');
        const extension = extensionIndex === -1 ? '' : fileName.slice(Math.max(0, extensionIndex));
        return fileName.slice(0, Math.max(0, 500 - extension.length)) + extension;
    }
    return fileName;
}
