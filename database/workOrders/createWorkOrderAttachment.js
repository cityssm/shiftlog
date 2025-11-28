import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function createWorkOrderAttachment(form, userName) {
    const pool = await getShiftLogConnectionPool();
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
    `));
    return result.recordset[0].workOrderAttachmentId;
}
