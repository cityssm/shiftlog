import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

interface AddShiftEmployeeForm {
  shiftId: number | string
  employeeNumber: string
  crewId?: number | string | null
  shiftEmployeeNote?: string
}

export default async function addShiftEmployee(
  form: AddShiftEmployeeForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('employeeNumber', form.employeeNumber)
      .input('crewId', form.crewId ?? null)
      .input('shiftEmployeeNote', form.shiftEmployeeNote ?? '').query(/* sql */ `
        insert into ShiftLog.ShiftEmployees (shiftId, employeeNumber, crewId, shiftEmployeeNote)
        values (@shiftId, @employeeNumber, @crewId, @shiftEmployeeNote)
      `)

    return true
  } catch {
    return false
  }
}
