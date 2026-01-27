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
      .input('shiftCrewNote', form.shiftCrewNote ?? '')
      .query(/* sql */ `
        INSERT INTO
          ShiftLog.ShiftCrews (shiftId, crewId, shiftCrewNote)
        VALUES
          (@shiftId, @crewId, @shiftCrewNote)
      `)

    // Get crew members
    const crewMembersResult = await pool
      .request()
      .input('crewId', form.crewId)
      .query(/* sql */ `
        SELECT
          employeeNumber
        FROM
          ShiftLog.CrewMembers
        WHERE
          crewId = @crewId
      `)

    // Add crew members to shift employees (if not already there)
    for (const member of crewMembersResult.recordset) {
      // eslint-disable-next-line no-await-in-loop
      await pool
        .request()
        .input('shiftId', form.shiftId)
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', member.employeeNumber)
        .input('crewId', form.crewId)
        .query(/* sql */ `
          IF NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEmployees
            WHERE
              shiftId = @shiftId
              AND employeeNumber = @employeeNumber
          ) BEGIN
          INSERT INTO
            ShiftLog.ShiftEmployees (
              shiftId,
              instance,
              employeeNumber,
              crewId,
              shiftEmployeeNote
            )
          VALUES
            (@shiftId, @instance, @employeeNumber, @crewId, '') END
        `)
    }

    // Get crew equipment
    const crewEquipmentResult = await pool
      .request()
      .input('crewId', form.crewId)
      .query(/* sql */ `
        SELECT
          equipmentNumber,
          employeeNumber
        FROM
          ShiftLog.CrewEquipment
        WHERE
          crewId = @crewId
      `)

    // Add crew equipment to shift equipment (if not already there)
    for (const equipment of crewEquipmentResult.recordset) {
      // eslint-disable-next-line no-await-in-loop
      await pool
        .request()
        .input('shiftId', form.shiftId)
        .input('instance', getConfigProperty('application.instance'))
        .input('equipmentNumber', equipment.equipmentNumber)
        .input('employeeNumber', equipment.employeeNumber ?? null)
        .query(/* sql */ `
          IF NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEquipment
            WHERE
              shiftId = @shiftId
              AND equipmentNumber = @equipmentNumber
          ) BEGIN
          INSERT INTO
            ShiftLog.ShiftEquipment (
              shiftId,
              instance,
              equipmentNumber,
              employeeNumber,
              shiftEquipmentNote
            )
          VALUES
            (
              @shiftId,
              @instance,
              @equipmentNumber,
              @employeeNumber,
              ''
            ) END
        `)
    }

    return true
  } catch {
    return false
  }
}
