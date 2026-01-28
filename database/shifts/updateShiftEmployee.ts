import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateShiftEmployeeForm {
  shiftId: number | string
  employeeNumber: string
  crewId?: number | string | null
}

export default async function updateShiftEmployee(
  form: UpdateShiftEmployeeForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('employeeNumber', form.employeeNumber)
      .input('crewId', form.crewId ?? undefined)
      .query(/* sql */ `
        UPDATE ShiftLog.ShiftEmployees
        SET
          crewId = @crewId
        WHERE
          shiftId = @shiftId
          AND employeeNumber = @employeeNumber
      `)

    return true
  } catch {
    return false
  }
}
