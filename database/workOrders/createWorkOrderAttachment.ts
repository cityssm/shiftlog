import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js'

import getWorkOrder from './getWorkOrder.js'

export interface CreateWorkOrderAttachmentForm {
  workOrderId: number | string
  
  attachmentFileName: string
  attachmentFileType: string
  attachmentFileSizeInBytes: number
  attachmentDescription?: string
  fileSystemPath: string
}

export default async function createWorkOrderAttachment(
  form: CreateWorkOrderAttachmentForm,
  userName: string
): Promise<number | undefined> {
  const workOrder = await getWorkOrder(form.workOrderId)

  if (workOrder === undefined) {
    return undefined
  }

  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderId', form.workOrderId)
    .input('attachmentFileName', form.attachmentFileName)
    .input('attachmentFileType', form.attachmentFileType)
    .input('attachmentFileSizeInBytes', form.attachmentFileSizeInBytes)
    .input('attachmentDescription', form.attachmentDescription ?? '')
    .input('fileSystemPath', form.fileSystemPath)
    .input('userName', userName)
    // eslint-disable-next-line no-secrets/no-secrets
    .query<{ workOrderAttachmentId: number }>(/* sql */ `
      INSERT INTO
        ShiftLog.WorkOrderAttachments (
          workOrderId,
          attachmentFileName,
          attachmentFileType,
          attachmentFileSizeInBytes,
          attachmentDescription,
          fileSystemPath,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.workOrderAttachmentId
      VALUES
        (
          @workOrderId,
          @attachmentFileName,
          @attachmentFileType,
          @attachmentFileSizeInBytes,
          @attachmentDescription,
          @fileSystemPath,
          @userName,
          @userName
        )
    `)

  if (result.rowsAffected[0] > 0) {
    // Send Notification
    sendNotificationWorkerMessage(
      'workOrder.update',
      typeof form.workOrderId === 'string'
        ? Number.parseInt(form.workOrderId, 10)
        : form.workOrderId
    )
  }

  return result.recordset[0].workOrderAttachmentId
}
