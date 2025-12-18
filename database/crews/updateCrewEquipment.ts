import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function updateCrewEquipment(
  crewId: number,
  equipmentNumber: string,
  employeeNumber?: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('crewId', crewId)
    .input('equipmentNumber', equipmentNumber)
    .input('employeeNumber', employeeNumber ?? undefined).query(/* sql */ `
      update ShiftLog.CrewEquipment
      set employeeNumber = @employeeNumber
      where crewId = @crewId
        and equipmentNumber = @equipmentNumber
    `)

  return result.rowsAffected[0] > 0
}
