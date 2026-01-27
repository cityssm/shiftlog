import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteCrew(crewId, user) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('crewId', crewId)
        .input('recordDelete_userName', user.userName)
        .query(/* sql */ `
      UPDATE ShiftLog.Crews
      SET
        recordDelete_userName = @recordDelete_userName,
        recordDelete_dateTime = getdate()
      WHERE
        instance = @instance
        AND crewId = @crewId
        AND recordDelete_dateTime IS NULL
    `);
    return result.rowsAffected[0] > 0;
}
