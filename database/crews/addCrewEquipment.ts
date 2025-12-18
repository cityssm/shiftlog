import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function addCrewEquipment(
  crewId: number,
  equipmentNumber: string,
  employeeNumber?: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('crewId', crewId)
    .input('equipmentNumber', equipmentNumber)
    .input('employeeNumber', employeeNumber ?? undefined).query(/* sql */ `
      insert into ShiftLog.CrewEquipment (
        crewId, instance, equipmentNumber, employeeNumber
      ) values (
        @crewId, @instance, @equipmentNumber, @employeeNumber
      )
    `)

  return result.rowsAffected[0] > 0
}
