import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteAssignedToItem(assignedToId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('assignedToId', assignedToId)
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.AssignedTo
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      WHERE
        assignedToId = @assignedToId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `);
    return result.rowsAffected[0] > 0;
}
