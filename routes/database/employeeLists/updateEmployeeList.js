import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateEmployeeList(employeeListFields, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        const result = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('employeeListId', employeeListFields.employeeListId)
            .input('employeeListName', employeeListFields.employeeListName)
            .input('userGroupId', employeeListFields.userGroupId ?? undefined)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(/* sql */ `
        UPDATE ShiftLog.EmployeeLists
        SET
          employeeListName = @employeeListName,
          userGroupId = @userGroupId,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        WHERE
          instance = @instance
          AND employeeListId = @employeeListId
          AND recordDelete_dateTime IS NULL
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
