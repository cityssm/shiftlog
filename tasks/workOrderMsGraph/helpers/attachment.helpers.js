import fs from 'node:fs/promises';
export async function writeAttachmentToFileSystem(filePath, attachmentContentBytes) {
    const attachmentContentBuffer = Buffer.from(attachmentContentBytes, 'base64');
    await fs.writeFile(filePath, attachmentContentBuffer);
    const stats = await fs.stat(filePath);
    return stats.size;
}
