import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteWorkOrderAttachment(
  workOrderAttachmentId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderAttachmentId', workOrderAttachmentId)
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.WorkOrderAttachments
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      WHERE
        workOrderAttachmentId = @workOrderAttachmentId
        AND recordDelete_dateTime IS NULL
    `)

  return result.rowsAffected[0] === 1
}
