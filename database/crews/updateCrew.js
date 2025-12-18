import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateCrew(crewForm, user) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('crewId', crewForm.crewId)
        .input('crewName', crewForm.crewName)
        .input('userGroupId', crewForm.userGroupId ?? undefined)
        .input('recordUpdate_userName', user.userName).query(/* sql */ `
      update ShiftLog.Crews
      set crewName = @crewName,
          userGroupId = @userGroupId,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = getdate()
      where instance = @instance
        and crewId = @crewId
        and recordDelete_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
