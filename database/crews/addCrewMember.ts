import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function addCrewMember(
  crewId: number,
  employeeNumber: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('crewId', crewId)
    .input('employeeNumber', employeeNumber).query(/* sql */ `
      insert into ShiftLog.CrewMembers (
        crewId, instance, employeeNumber
      ) values (
        @crewId, @instance, @employeeNumber
      )
    `)

  return result.rowsAffected[0] > 0
}
