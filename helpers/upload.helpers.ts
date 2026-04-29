import fs from 'node:fs'
import path from 'node:path'

import { getConfigProperty } from './config.helpers.js'

function sanitizeFileName(originalName: string): string {
  // Remove control characters, newlines, and null bytes
  // eslint-disable-next-line no-control-regex
  let sanitized = originalName.replaceAll(/[\u0000-\u001F\u007F-\u009F]/g, '')

  // Remove characters that are problematic in file systems
  sanitized = sanitized.replaceAll(/[<>:"/\\|?*]/g, '_')

  // Remove leading dots to prevent hidden files on Unix
  sanitized = sanitized.replace(/^\.+/, '')

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

export function getAttachmentStoragePathForFileName(originalName: string): {
  /** Full Path - For use in file operations */
  filePath: string

  /** Relative Path - For storing in the database */
  fileSystemPath: string
} {
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
  const sanitizedFileName = sanitizeFileName(originalName)
  const uniqueFileName = `${timestamp}_${sanitizedFileName}`

  const filePath = path.join(fullDirectory, uniqueFileName)
  const fileSystemPath = path.join(subfolderDirectory, uniqueFileName)

  return {
    filePath,
    fileSystemPath
  }
}
