import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateAssignedToItem(form, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('assignedToId', form.assignedToId)
        .input('assignedToName', form.assignedToName)
        .input('userGroupId', form.userGroupId && form.userGroupId !== '' ? form.userGroupId : null)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.AssignedTo
      set
        assignedToName = @assignedToName,
        userGroupId = @userGroupId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where assignedToId = @assignedToId
        and instance = @instance
        and recordDelete_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
