import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type {
  Crew,
  CrewEquipment,
  CrewMember
} from '../../types/record.types.js'

interface CrewWithDetails extends Crew {
  members: CrewMember[]
  equipment: CrewEquipment[]
}

export default async function getCrew(
  crewId: number
): Promise<CrewWithDetails | undefined> {
  const pool = await getShiftLogConnectionPool()

  // Get the crew
  const crewResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('crewId', crewId).query<Crew>(/* sql */ `
      select c.crewId, c.crewName,
        c.userGroupId,
        ug.userGroupName,
        c.recordCreate_userName, c.recordCreate_dateTime,
        c.recordUpdate_userName, c.recordUpdate_dateTime
      from ShiftLog.Crews c
      left join ShiftLog.UserGroups ug on c.userGroupId = ug.userGroupId
      where
        c.instance = @instance
        and c.crewId = @crewId
        and c.recordDelete_dateTime is null
    `)

  if (crewResult.recordset.length === 0) {
    return undefined
  }

  const crew = crewResult.recordset[0]

  // Get the members
  const membersResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('crewId', crewId).query<CrewMember>(/* sql */ `
      select cm.crewId, cm.employeeNumber,
        e.firstName, e.lastName
      from ShiftLog.CrewMembers cm
      left join ShiftLog.Employees e on
        cm.instance = e.instance and
        cm.employeeNumber = e.employeeNumber and
        e.recordDelete_dateTime is null
      where
        cm.instance = @instance
        and cm.crewId = @crewId
      order by e.lastName, e.firstName
    `)

  // Get the equipment
  const equipmentResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('crewId', crewId).query<CrewEquipment>(/* sql */ `
      select ce.crewId, ce.equipmentNumber, ce.employeeNumber,
        eq.equipmentName,
        eq.employeeListId,
        el.employeeListName,
        e.firstName as employeeFirstName, e.lastName as employeeLastName
      from ShiftLog.CrewEquipment ce
      left join ShiftLog.Equipment eq on
        ce.instance = eq.instance and
        ce.equipmentNumber = eq.equipmentNumber and
        eq.recordDelete_dateTime is null
      left join ShiftLog.EmployeeLists el on
        eq.employeeListId = el.employeeListId and
        el.recordDelete_dateTime is null
      left join ShiftLog.Employees e on
        ce.instance = e.instance and
        ce.employeeNumber = e.employeeNumber and
        e.recordDelete_dateTime is null
      where
        ce.instance = @instance
        and ce.crewId = @crewId
      order by eq.equipmentName
    `)

  return {
    ...crew,
    members: membersResult.recordset,
    equipment: equipmentResult.recordset
  }
}
