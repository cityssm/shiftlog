import fs from 'node:fs'
import path from 'node:path'

import Debug from 'debug'
import type { Request, Response } from 'express'

import createWorkOrderAttachment from '../../database/workOrders/createWorkOrderAttachment.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

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
  | { success: true; workOrderAttachmentId?: number }

function sanitizeFileName(originalName: string): string {
  // Remove control characters, newlines, and null bytes
  // eslint-disable-next-line no-control-regex, sonarjs/no-control-regex
  let sanitized = originalName.replaceAll(/[\u0000-\u001F\u007F-\u009F]/gv, '')

  // Remove characters that are problematic in file systems
  // eslint-disable-next-line require-unicode-regexp
  sanitized = sanitized.replaceAll(/[<>:"/\\|?*]/g, '_')

  // Remove leading dots to prevent hidden files on Unix
  sanitized = sanitized.replace(/^\.+/v, '')

  // Limit length to prevent issues with long filenames
  if (sanitized.length > 200) {
    const extension = path.extname(sanitized)
    const basename = path.basename(sanitized, extension)
    sanitized = basename.slice(0, 200 - extension.length) + extension
  }

  // Fallback to a default name if sanitization removed everything
  if (sanitized.length === 0) {
    sanitized = 'attachment'
  }

  return sanitized
}

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

  // Create year/month subdirectory structure
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')

  const storagePath = getConfigProperty('application.attachmentStoragePath')

  const subfolderDirectory = path.join(year, month)
  const fullDirectory = path.join(storagePath, subfolderDirectory)

  // Ensure directory exists
  if (!fs.existsSync(fullDirectory)) {
    fs.mkdirSync(fullDirectory, { recursive: true })
  }

  // Generate unique filename to avoid collisions
  const timestamp = Date.now()
  const sanitizedFileName = sanitizeFileName(file.originalname)
  const uniqueFileName = `${timestamp}_${sanitizedFileName}`
  const filePath = path.join(fullDirectory, uniqueFileName)
  const fileSystemPath = path.join(subfolderDirectory, uniqueFileName)

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
