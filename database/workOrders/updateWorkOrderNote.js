import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateWorkOrderNote(updateWorkOrderNoteForm, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderId', updateWorkOrderNoteForm.workOrderId)
        .input('noteSequence', updateWorkOrderNoteForm.noteSequence)
        .input('noteText', updateWorkOrderNoteForm.noteText)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderNotes
      set
        noteText = @noteText,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where workOrderId = @workOrderId
        and noteSequence = @noteSequence
        and recordDelete_dateTime is null
        and workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
    `);
    return result.rowsAffected[0] > 0;
}
