import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface AddShiftEmployeeForm {
  shiftId: number | string
  employeeNumber: string
  crewId?: number | string | null
  shiftEmployeeNote?: string
}

export default async function addShiftEmployee(
  form: AddShiftEmployeeForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('instance', getConfigProperty('application.instance'))
      .input('employeeNumber', form.employeeNumber)
      .input('crewId', (form.crewId ?? '') === '' ? undefined : form.crewId)
      .input('shiftEmployeeNote', form.shiftEmployeeNote ?? '')
      .query(/* sql */ `
        INSERT INTO
          ShiftLog.ShiftEmployees (
            shiftId,
            instance,
            employeeNumber,
            crewId,
            shiftEmployeeNote
          )
        VALUES
          (
            @shiftId,
            @instance,
            @employeeNumber,
            @crewId,
            @shiftEmployeeNote
          )
      `)

    return true
  } catch {
    return false
  }
}
