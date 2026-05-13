import fs from 'node:fs/promises'

export async function writeAttachmentToFileSystem(
  filePath: string,
  attachmentContentBytes: string
): Promise<number> {
  const attachmentContentBuffer = Buffer.from(attachmentContentBytes, 'base64')
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
