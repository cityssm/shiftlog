import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function reorderAssignedToItems(assignedToIds, userName) {
    const pool = await getShiftLogConnectionPool();
    let orderNumber = 0;
    for (const assignedToId of assignedToIds) {
        orderNumber += 1;
        // eslint-disable-next-line no-await-in-loop
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('assignedToId', assignedToId)
            .input('orderNumber', orderNumber)
            .input('userName', userName).query(/* sql */ `
        update ShiftLog.AssignedTo
        set
          orderNumber = @orderNumber,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
        where assignedToId = @assignedToId
          and instance = @instance
          and recordDelete_dateTime is null
      `);
    }
    return true;
}
