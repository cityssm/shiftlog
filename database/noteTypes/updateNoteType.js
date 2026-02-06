import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateNoteType(noteTypeFields, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('noteTypeId', noteTypeFields.noteTypeId)
            .input('noteType', noteTypeFields.noteType)
            .input('userGroupId', noteTypeFields.userGroupId ?? null)
            .input('isAvailableWorkOrders', noteTypeFields.isAvailableWorkOrders)
            .input('isAvailableShifts', noteTypeFields.isAvailableShifts)
            .input('isAvailableTimesheets', noteTypeFields.isAvailableTimesheets)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(/* sql */ `
        UPDATE
          ShiftLog.NoteTypes
        SET
          noteType = @noteType,
          userGroupId = @userGroupId,
          isAvailableWorkOrders = @isAvailableWorkOrders,
          isAvailableShifts = @isAvailableShifts,
          isAvailableTimesheets = @isAvailableTimesheets,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        WHERE
          instance = @instance
          AND noteTypeId = @noteTypeId
          AND recordDelete_dateTime IS NULL
      `);
        return true;
    }
    catch {
        return false;
    }
}
