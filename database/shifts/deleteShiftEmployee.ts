import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface DeleteShiftEmployeeForm {
  shiftId: number | string
  employeeNumber: string
}

export default async function deleteShiftEmployee(
  form: DeleteShiftEmployeeForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('employeeNumber', form.employeeNumber)
      .query(/* sql */ `
        DELETE FROM ShiftLog.ShiftEmployees
        WHERE
          shiftId = @shiftId
          AND employeeNumber = @employeeNumber
      `)

    return true
  } catch {
    return false
  }
}
