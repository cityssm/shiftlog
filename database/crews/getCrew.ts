import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type {
  Crew,
  CrewEquipment,
  CrewMember
} from '../../types/record.types.js'

export interface CrewWithDetails extends Crew {
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
    .input('crewId', crewId)
    .query<Crew>(/* sql */ `
      SELECT
        c.crewId,
        c.crewName,
        c.userGroupId,
        ug.userGroupName,
        c.recordCreate_userName,
        c.recordCreate_dateTime,
        c.recordUpdate_userName,
        c.recordUpdate_dateTime
      FROM
        ShiftLog.Crews c
        LEFT JOIN ShiftLog.UserGroups ug ON c.userGroupId = ug.userGroupId
      WHERE
        c.instance = @instance
        AND c.crewId = @crewId
        AND c.recordDelete_dateTime IS NULL
    `)

  if (crewResult.recordset.length === 0) {
    return undefined
  }

  const crew = crewResult.recordset[0]

  // Get the members
  const membersResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('crewId', crewId)
    .query<CrewMember>(/* sql */ `
      SELECT
        cm.crewId,
        cm.employeeNumber,
        e.firstName,
        e.lastName
      FROM
        ShiftLog.CrewMembers cm
        LEFT JOIN ShiftLog.Employees e ON cm.instance = e.instance
        AND cm.employeeNumber = e.employeeNumber
        AND e.recordDelete_dateTime IS NULL
      WHERE
        cm.instance = @instance
        AND cm.crewId = @crewId
      ORDER BY
        e.lastName,
        e.firstName
    `)

  // Get the equipment
  const equipmentResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('crewId', crewId)
    .query<CrewEquipment>(/* sql */ `
      SELECT
        ce.crewId,
        ce.equipmentNumber,
        ce.employeeNumber,
        eq.equipmentName,
        eq.employeeListId,
        el.employeeListName,
        e.firstName AS employeeFirstName,
        e.lastName AS employeeLastName
      FROM
        ShiftLog.CrewEquipment ce
        LEFT JOIN ShiftLog.Equipment eq ON ce.instance = eq.instance
        AND ce.equipmentNumber = eq.equipmentNumber
        AND eq.recordDelete_dateTime IS NULL
        LEFT JOIN ShiftLog.EmployeeLists el ON eq.employeeListId = el.employeeListId
        AND el.recordDelete_dateTime IS NULL
        LEFT JOIN ShiftLog.Employees e ON ce.instance = e.instance
        AND ce.employeeNumber = e.employeeNumber
        AND e.recordDelete_dateTime IS NULL
      WHERE
        ce.instance = @instance
        AND ce.crewId = @crewId
      ORDER BY
        eq.equipmentName
    `)

  return {
    ...crew,
    members: membersResult.recordset,
    equipment: equipmentResult.recordset
  }
}
