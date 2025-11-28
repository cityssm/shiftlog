import fs from 'node:fs'
import path from 'node:path'

import type { Request, Response } from 'express'

import getWorkOrderAttachment from '../../database/workOrders/getWorkOrderAttachment.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<{ workOrderAttachmentId: string }>,
  response: Response
): Promise<void> {
  const attachment = await getWorkOrderAttachment(
    request.params.workOrderAttachmentId
  )

  if (attachment === undefined) {
    response.status(404).send('Attachment not found')
    return
  }

  const storagePath = getConfigProperty('application.attachmentStoragePath')
  const filePath = path.join(storagePath, attachment.fileSystemPath)

  if (!fs.existsSync(filePath)) {
    response.status(404).send('File not found')
    return
  }

  response.setHeader('Content-Type', attachment.attachmentFileType)
  response.setHeader(
    'Content-Disposition',
    `attachment; filename="${attachment.attachmentFileName}"`
  )
  response.setHeader('Content-Length', attachment.attachmentFileSizeInBytes)

  const fileStream = fs.createReadStream(filePath)
  fileStream.pipe(response)
}
