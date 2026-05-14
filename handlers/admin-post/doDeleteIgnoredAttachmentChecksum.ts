import type { Request, Response } from 'express'

import deleteIgnoredAttachmentChecksum from '../../database/ignoredAttachmentChecksums/deleteIgnoredAttachmentChecksum.js'

export type DoDeleteIgnoredAttachmentChecksumResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
    }

export default async function handler(
  request: Request<unknown, unknown, { fileChecksum: string }>,
  response: Response<DoDeleteIgnoredAttachmentChecksumResponse>
): Promise<void> {
  const success = await deleteIgnoredAttachmentChecksum(
    request.body.fileChecksum,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      success: true
    })
  } else {
    response.json({
      success: false,
      message: 'Checksum could not be removed from ignored attachments.'
    })
  }
}
