import type { Request, Response } from 'express'

import getIgnoredAttachmentChecksums from '../../database/ignoredAttachmentChecksums/getIgnoredAttachmentChecksums.js'
import getWorkOrderAttachmentByChecksum from '../../database/workOrders/getWorkOrderAttachmentByChecksum.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const ignoredAttachmentChecksums = await getIgnoredAttachmentChecksums()

  // Fetch attachment info for each checksum
  const ignoredAttachmentsWithInfo = await Promise.all(
    ignoredAttachmentChecksums.map(async (ignoredAttachment) => {
      const attachment = await getWorkOrderAttachmentByChecksum(
        ignoredAttachment.fileChecksum
      )
      return {
        ...ignoredAttachment,
        attachment
      }
    })
  )

  response.render('admin/ignoredAttachments', {
    headTitle: 'Ignored Attachment Management',
    section: 'admin',

    ignoredAttachmentChecksums: ignoredAttachmentsWithInfo
  })
}
