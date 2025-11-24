// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, unicorn/no-null */
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateWorkOrderNote(updateWorkOrderNoteForm, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
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
    `));
    return result.rowsAffected[0] > 0;
}
