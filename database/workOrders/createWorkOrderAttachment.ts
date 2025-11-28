import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

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
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('workOrderId', form.workOrderId)
    .input('attachmentFileName', form.attachmentFileName)
    .input('attachmentFileType', form.attachmentFileType)
    .input('attachmentFileSizeInBytes', form.attachmentFileSizeInBytes)
    .input('attachmentDescription', form.attachmentDescription ?? '')
    .input('fileSystemPath', form.fileSystemPath)
    .input('userName', userName).query(/* sql */ `
      insert into ShiftLog.WorkOrderAttachments (
        workOrderId,
        attachmentFileName,
        attachmentFileType,
        attachmentFileSizeInBytes,
        attachmentDescription,
        fileSystemPath,
        recordCreate_userName,
        recordUpdate_userName
      )
      output inserted.workOrderAttachmentId
      values (
        @workOrderId,
        @attachmentFileName,
        @attachmentFileType,
        @attachmentFileSizeInBytes,
        @attachmentDescription,
        @fileSystemPath,
        @userName,
        @userName
      )
    `)) as mssql.IResult<{ workOrderAttachmentId: number }>

  return result.recordset[0].workOrderAttachmentId
}
