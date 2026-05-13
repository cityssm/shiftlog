import crypto from 'node:crypto'
import fs from 'node:fs/promises'

export function attachmentContentBytesToBuffer(
  attachmentContentBytes: string
): Buffer {
  return Buffer.from(attachmentContentBytes, 'base64')
}

export function attachmentContentBytesToChecksum(
  attachmentContentBuffer: Buffer
): string {
  const checksum = crypto
    .createHash('sha256')
    .update(attachmentContentBuffer)
    .digest('hex')

  return checksum
}

export async function writeAttachmentToFileSystem(
  filePath: string,
  attachmentContentBuffer: Buffer
): Promise<number> {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(filePath, attachmentContentBuffer)

  const stats = await fs.stat(filePath)

  return stats.size
}

export function getAttachmentFileNameFromFileName(fileName: string): string {
  if (fileName.length > 500) {
    const extensionIndex = fileName.lastIndexOf('.')

    const extension =
      extensionIndex === -1 ? '' : fileName.slice(Math.max(0, extensionIndex))

    return fileName.slice(0, Math.max(0, 500 - extension.length)) + extension
  }

  return fileName
}
