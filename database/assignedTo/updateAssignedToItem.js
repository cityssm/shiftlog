import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateAssignedToItem(form, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('assignedToId', form.assignedToId)
        .input('assignedToName', form.assignedToName)
        .input('assignedToEmailAddress', form.assignedToEmailAddress ?? '')
        .input('userGroupId', form.userGroupId && form.userGroupId !== '' ? form.userGroupId : null)
        .input('userName', userName)
        .query(`
      UPDATE ShiftLog.AssignedTo
      SET
        assignedToName = @assignedToName,
        assignedToEmailAddress = @assignedToEmailAddress,
        userGroupId = @userGroupId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        assignedToId = @assignedToId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `);
    return result.rowsAffected[0] > 0;
}
