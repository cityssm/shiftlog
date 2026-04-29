import fs from 'node:fs'

import Debug from 'debug'
import type { Request, Response } from 'express'

import createWorkOrderAttachment from '../../database/workOrders/createWorkOrderAttachment.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getAttachmentStoragePathForFileName } from '../../helpers/upload.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:workOrders-post:doUploadWorkOrderAttachment`
)

interface MulterRequest extends Request {
  file?: Express.Multer.File
}

export type DoUploadWorkOrderAttachmentResponse =
  | {
      success: false
      message: string
    }
  | { success: true; workOrderAttachmentId: number }

export default async function handler(
  request: MulterRequest,
  response: Response<DoUploadWorkOrderAttachmentResponse>
): Promise<void> {
  const file = request.file

  if (file === undefined) {
    response.json({
      success: false,
      message: 'No file uploaded.'
    })

    return
  }

  const workOrderId = request.body.workOrderId as string
  const attachmentDescription = (request.body.attachmentDescription ??
    '') as string

  const { filePath, fileSystemPath } = getAttachmentStoragePathForFileName(
    file.originalname
  )

  try {
    // Move file from temp location to permanent storage
    fs.renameSync(file.path, filePath)

    // Create database record
    const workOrderAttachmentId = await createWorkOrderAttachment(
      {
        workOrderId,
        attachmentFileName: file.originalname,
        attachmentFileType: file.mimetype,
        attachmentFileSizeInBytes: file.size,
        attachmentDescription,
        fileSystemPath
      },
      request.session.user?.userName ?? ''
    )

    if (workOrderAttachmentId === undefined) {
      throw new Error('Work order not found')
    }

    response.json({
      success: true,
      workOrderAttachmentId
    })
  } catch (error) {
    debug(
      `Error uploading attachment for ${getConfigProperty('workOrders.sectionNameSingular')} %s: %O`,
      workOrderId,
      error
    )

    // Clean up uploaded file on error
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (cleanupError) {
      debug('Error cleaning up files after upload failure: %O', cleanupError)
    }

    response.json({
      success: false,

      message: 'Failed to save attachment.'
    })
  }
}
