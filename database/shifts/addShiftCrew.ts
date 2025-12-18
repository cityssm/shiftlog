import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

interface AddShiftCrewForm {
  shiftId: number | string
  crewId: number | string
  shiftCrewNote?: string
}

export default async function addShiftCrew(
  form: AddShiftCrewForm,
  user: User
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    // Add the crew to the shift
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('crewId', form.crewId)
      .input('shiftCrewNote', form.shiftCrewNote ?? '').query(/* sql */ `
        insert into ShiftLog.ShiftCrews (shiftId, crewId, shiftCrewNote)
        values (@shiftId, @crewId, @shiftCrewNote)
      `)

    // Get crew members
    const crewMembersResult = await pool.request().input('crewId', form.crewId)
      .query(/* sql */ `
        select employeeNumber
        from ShiftLog.CrewMembers
        where crewId = @crewId
      `)

    // Add crew members to shift employees (if not already there)
    for (const member of crewMembersResult.recordset) {
      await pool
        .request()
        .input('shiftId', form.shiftId)
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', member.employeeNumber)
        .input('crewId', form.crewId).query(/* sql */ `
          if not exists (
            select 1 from ShiftLog.ShiftEmployees
            where shiftId = @shiftId and employeeNumber = @employeeNumber
          )
          begin
            insert into ShiftLog.ShiftEmployees (shiftId, instance, employeeNumber, crewId, shiftEmployeeNote)
            values (@shiftId, @instance, @employeeNumber, @crewId, '')
          end
        `)
    }

    // Get crew equipment
    const crewEquipmentResult = await pool.request().input('crewId', form.crewId)
      .query(/* sql */ `
        select equipmentNumber, employeeNumber
        from ShiftLog.CrewEquipment
        where crewId = @crewId
      `)

    // Add crew equipment to shift equipment (if not already there)
    for (const equipment of crewEquipmentResult.recordset) {
      await pool
        .request()
        .input('shiftId', form.shiftId)
        .input('instance', getConfigProperty('application.instance'))
        .input('equipmentNumber', equipment.equipmentNumber)
        .input('employeeNumber', equipment.employeeNumber ?? null).query(/* sql */ `
          if not exists (
            select 1 from ShiftLog.ShiftEquipment
            where shiftId = @shiftId and equipmentNumber = @equipmentNumber
          )
          begin
            insert into ShiftLog.ShiftEquipment (shiftId, instance, equipmentNumber, employeeNumber, shiftEquipmentNote)
            values (@shiftId, @instance, @equipmentNumber, @employeeNumber, '')
          end
        `)
    }

    return true
  } catch {
    return false
  }
}
