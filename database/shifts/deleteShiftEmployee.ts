import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

interface DeleteShiftEmployeeForm {
  shiftId: number | string
  employeeNumber: string
}

export default async function deleteShiftEmployee(
  form: DeleteShiftEmployeeForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

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
