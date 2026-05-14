import type { Request, Response } from 'express'

import getIgnoredAttachmentChecksums from '../../database/ignoredAttachmentChecksums/getIgnoredAttachmentChecksums.js'
import getWorkOrderAttachmentsByChecksums from '../../database/workOrders/getWorkOrderAttachmentsByChecksums.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const ignoredAttachmentChecksums = await getIgnoredAttachmentChecksums()

  // Fetch all attachment info in a single batch query
  const checksums = ignoredAttachmentChecksums.map((item) => item.fileChecksum)
  const attachmentMap = await getWorkOrderAttachmentsByChecksums(checksums)

  const ignoredAttachmentsWithInfo = ignoredAttachmentChecksums.map(
    (ignoredAttachment) => ({
      ...ignoredAttachment,
      attachment: attachmentMap.get(ignoredAttachment.fileChecksum)
    })
  )

  response.render('admin/ignoredAttachments', {
    headTitle: 'Ignored Attachment Management',
    section: 'admin',

    ignoredAttachmentChecksums: ignoredAttachmentsWithInfo
  })
}
