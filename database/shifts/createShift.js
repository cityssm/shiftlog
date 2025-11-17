import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function createShift(createShiftForm, userName) {
    const pool = await getShiftLogConnectionPool();
    let recordLockDate = new Date(createShiftForm.shiftDateString);
    if (recordLockDate < new Date()) {
        recordLockDate = new Date();
    }
    recordLockDate.setDate(recordLockDate.getDate() + 7);
    const result = (await pool
        .request()
        .input('shiftDate', createShiftForm.shiftDateString)
        .input('shiftTimeDataListItemId', createShiftForm.shiftTimeDataListItemId)
        .input('shiftTypeDataListItemId', createShiftForm.shiftTypeDataListItemId)
        .input('supervisorEmployeeNumber', createShiftForm.supervisorEmployeeNumber)
        .input('shiftDescription', createShiftForm.shiftDescription)
        .input('userName', userName)
        .input('recordLockDate', recordLockDate).query(/* sql */ `
      insert into ShiftLog.Shifts (
        shiftTypeDataListItemId,
        supervisorEmployeeNumber,
        shiftDate,
        shiftTimeDataListItemId,
        shiftDescription,
        recordCreate_userName, recordUpdate_userName,
        recordLock_dateTime
      )
      output inserted.shiftId
      values (
        @shiftTypeDataListItemId,
        @supervisorEmployeeNumber,
        @shiftDate,
        @shiftTimeDataListItemId,
        @shiftDescription,
        @userName, @userName,
        @recordLockDate
      )
    `));
    return result.recordset[0].shiftId;
}
