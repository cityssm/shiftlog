import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function createAssignedToItem(form, userName) {
    const pool = await getShiftLogConnectionPool();
    // Get the next order number
    const orderResult = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance')).query(
    /* sql */ `
      select isnull(max(orderNumber), 0) + 1 as nextOrderNumber
      from ShiftLog.AssignedTo
      where instance = @instance
        and recordDelete_dateTime is null
    `));
    const nextOrderNumber = orderResult.recordset[0].nextOrderNumber;
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('assignedToName', form.assignedToName)
        .input('userGroupId', form.userGroupId && form.userGroupId !== '' ? form.userGroupId : null)
        .input('orderNumber', nextOrderNumber)
        .input('userName', userName).query(/* sql */ `
      insert into ShiftLog.AssignedTo (
        instance,
        assignedToName,
        userGroupId,
        orderNumber,
        recordCreate_userName,
        recordUpdate_userName
      )
      output inserted.assignedToId
      values (
        @instance,
        @assignedToName,
        @userGroupId,
        @orderNumber,
        @userName,
        @userName
      )
    `));
    return result.recordset[0].assignedToId;
}
