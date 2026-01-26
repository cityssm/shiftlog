import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface UpdateShiftEmployeeForm {
  shiftId: number | string
  employeeNumber: string
  crewId?: number | string | null
}

export default async function updateShiftEmployee(
  form: UpdateShiftEmployeeForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('employeeNumber', form.employeeNumber)
      .input('crewId', form.crewId ?? undefined).query(/* sql */ `
        update ShiftLog.ShiftEmployees
        set crewId = @crewId
        where shiftId = @shiftId
          and employeeNumber = @employeeNumber
      `)

    return true
  } catch {
    return false
  }
}
