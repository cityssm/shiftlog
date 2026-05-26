import type { Request, Response } from 'express'

import updateWorkOrderAttachment, {
  type UpdateWorkOrderAttachmentForm
} from '../../database/workOrders/updateWorkOrderAttachmentDescription.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { TRANSCRIPTION_IN_PROGRESS } from '../../tasks/transcriptions/constants.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderAttachmentResponse = {
  success: boolean
}

interface DoUpdateWorkOrderAttachmentForm extends UpdateWorkOrderAttachmentForm {
  generateWithTranscription?: string
}

export default async function handler(
  request: Request<unknown, unknown, DoUpdateWorkOrderAttachmentForm>,
  response: Response<DoUpdateWorkOrderAttachmentResponse>
): Promise<void> {
  const generateWithTranscription =
    getConfigProperty('transcriptions.isEnabled') &&
    request.body.generateWithTranscription !== undefined

  const success = await updateWorkOrderAttachment(
    {
      workOrderAttachmentId: request.body.workOrderAttachmentId,
      attachmentDescription: generateWithTranscription
        ? TRANSCRIPTION_IN_PROGRESS
        : request.body.attachmentDescription
    },
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
