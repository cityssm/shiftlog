import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface AddCrewForm {
  crewName: string
  userGroupId?: number
}

export default async function addCrew(
  crewForm: AddCrewForm,
  user: User
): Promise<number | undefined> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('crewName', crewForm.crewName)
    .input('userGroupId', crewForm.userGroupId ?? undefined)
    .input('recordCreate_userName', user.userName)
    .input('recordUpdate_userName', user.userName)
    .query(/* sql */ `
      INSERT INTO
        ShiftLog.Crews (
          instance,
          crewName,
          userGroupId,
          recordCreate_userName,
          recordUpdate_userName
        )
      VALUES
        (
          @instance,
          @crewName,
          @userGroupId,
          @recordCreate_userName,
          @recordUpdate_userName
        );

      SELECT
        cast(scope_identity() AS INT) AS crewId;
    `)

  return (result.recordset[0] as { crewId: number }).crewId
}
