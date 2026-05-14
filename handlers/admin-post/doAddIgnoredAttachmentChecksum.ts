import type { Request, Response } from 'express'

import upsertIgnoredAttachmentChecksum from '../../database/ignoredAttachmentChecksums/upsertIgnoredAttachmentChecksum.js'

export type DoAddIgnoredAttachmentChecksumResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
    }

const FILE_CHECKSUM_LENGTH = 64
const FILE_CHECKSUM_REGEX = /^[a-f\d]{64}$/i

export default async function handler(
  request: Request<unknown, unknown, { fileChecksum?: string; noteText?: string }>,
  response: Response<DoAddIgnoredAttachmentChecksumResponse>
): Promise<void> {
  const fileChecksum = (request.body.fileChecksum ?? '').trim().toLowerCase()
  const noteText = (request.body.noteText ?? '').trim()

  if (
    fileChecksum.length !== FILE_CHECKSUM_LENGTH ||
    !FILE_CHECKSUM_REGEX.test(fileChecksum)
  ) {
    response.json({
      success: false,
      message: 'Please enter a valid 64-character SHA-256 checksum.'
    })
    return
  }

  if (noteText === '') {
    response.json({
      success: false,
      message: 'Please enter a note.'
    })
    return
  }

  const success = await upsertIgnoredAttachmentChecksum(
    fileChecksum,
    noteText,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      success: true
    })
  } else {
    response.json({
      success: false,
      message: 'Checksum could not be added to ignored attachments.'
    })
  }
}
