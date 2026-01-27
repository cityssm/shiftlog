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
            .input('userName', userName)
            .query(/* sql */ `
        UPDATE ShiftLog.AssignedTo
        SET
          orderNumber = @orderNumber,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
        WHERE
          assignedToId = @assignedToId
          AND instance = @instance
          AND recordDelete_dateTime IS NULL
      `);
    }
    return true;
}
