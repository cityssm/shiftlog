import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function createAssignedToItem(form, userName) {
    const pool = await getShiftLogConnectionPool();
    // Check if a deleted item with the same name exists
    const existingResult = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('assignedToName', form.assignedToName).query(
    /* sql */ `
      select assignedToId
      from ShiftLog.AssignedTo
      where instance = @instance
        and assignedToName = @assignedToName
        and recordDelete_dateTime is not null
    `));
    // If a deleted item exists, undelete it
    if (existingResult.recordset.length > 0) {
        const assignedToId = existingResult.recordset[0].assignedToId;
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('assignedToId', assignedToId)
            .input('userGroupId', form.userGroupId && form.userGroupId !== '' ? form.userGroupId : null)
            .input('userName', userName).query(/* sql */ `
        update ShiftLog.AssignedTo
        set
          userGroupId = @userGroupId,
          recordDelete_userName = null,
          recordDelete_dateTime = null,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
        where assignedToId = @assignedToId
          and instance = @instance
      `);
        return assignedToId;
    }
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
