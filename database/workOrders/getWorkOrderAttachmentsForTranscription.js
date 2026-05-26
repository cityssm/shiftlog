import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { TRANSCRIPTION_IN_PROGRESS } from '../../tasks/transcriptions/constants.js';
export default async function getWorkOrderAttachmentsForTranscription() {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('transcriptionInProgress', TRANSCRIPTION_IN_PROGRESS)
        .input('instance', getConfigProperty('application.instance'))
        .query(`
      SELECT
        workOrderAttachmentId,
        fileSystemPath
      FROM
        ShiftLog.WorkOrderAttachments wao
      WHERE
        wao.recordDelete_dateTime IS NULL
        AND wao.attachmentDescription = @transcriptionInProgress
        AND wao.workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
    `);
    return result.recordset;
}
